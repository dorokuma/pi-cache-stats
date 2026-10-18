---
status: active
superseded_by: ""
supersedes: "20260919-footer-tps-slot.md"
模块: extensions
---

# Footer TPS 口径切换：流式解码窗口（magpie 候选 A）与非流式端到端回退

## 一句话结论

Footer `▸ <n> t/s` 从「`before_provider_request -> turn_end` 端到端墙钟耗时」切换为与 magpie 对齐的**流式解码窗口口径**（候选 A：剔除 TTFT 预填充与工具执行耗时、按需剥离思考窗口、四重守卫不过返 `n/a`），无流式 delta 事件时回退端到端口径。

## 背景

原实现用 `output / (turn_end - before_provider_request)` 估算 TPS，存在三处系统性失真：
1. **TTFT 预填充混入分母**：长上下文或深度思考前的首 token 排队/预填充耗时（常达 5~10s）被计入生成窗口，导致解码 90~140 t/s 的回合被稀释为 20~50 t/s。
2. **工具执行耗时混入分母**：Pi `agent-loop` 在流式输出完成后先执行本轮全部 tool calls，最后才触发 `turn_end`；且 `agent-loop` 对 `done`/`error` 流事件直接走 `message_end` 而不发 `message_update(type="done")`，若以 `turn_end` 为终点会把数秒至数十秒的工具耗时算进分母。
3. **思考与正文混合**：当模型先输出 `thinking_delta` 再输出 `text_delta`/`toolcall_delta` 且 `usage` 汇报了 `reasoning` token 数时，思考阶段的慢速或停顿会拉低正文解码速率；反之像 Anthropic 不单独上报 `reasoning` token 数（`reasoning = 0`）时，若盲目按 `firstTextAt` 切分而分子仍用全部 `output`，又会人为虚高 TPS。

## 决策

1. **`normalizeUsage` 补齐 `reasoning` 提取**：按 `u.reasoning ?? u.reasoning_tokens ?? u.reasoningTokens ?? u.completion_tokens_details?.reasoning_tokens ?? u.output_tokens_details?.reasoning_tokens ?? 0` 优先级链提取并通过 `clampNonNeg` 兜底为非负有限数（默认 `0`）。
2. **流式打点与单次消费状态机**：
   - `InstanceState` 新增 `streamFirstThinkingAt`、`streamFirstTextAt`、`streamLastDeltaAt`、`streamDoneAt`，统一由 `clearTurnTiming(state)`（连同 `providerRequestStartedAt`）清空。
   - `before_provider_request` 先调 `clearTurnTiming(state)` 再记 `providerRequestStartedAt = Date.now()`，使 400/retry 重发自动丢弃半截流式戳。
   - `message_update` 只读 `event.assistantMessageEvent.type` 与 `delta !== ""`，不缓存 `event.message` / `partial`、不触发 `refreshFooter`：`thinking_delta` 记首次 `streamFirstThinkingAt` 与 `streamLastDeltaAt`；`text_delta` / `toolcall_delta` 并入正文解码窗口记首次 `streamFirstTextAt` 与 `streamLastDeltaAt`；`type === "done"` 记 `streamDoneAt`。
   - **`message_end` 补打 `streamDoneAt`**：针对 `agent-loop` 不经 `message_update` 转发 `done` 事件且在工具执行前先发 `message_end` 的时序，当 `role === "assistant"`、`streamDoneAt === null` 且本轮已有任一打点时，在 `message_end` 记录 `streamDoneAt = Date.now()`，锁定工具执行前的真实流结束时刻。
   - `turn_end` 快照 `TurnTimingStamps`（含 `turnEndedAt = Date.now()`）后立即 `clearTurnTiming(state)`，保证每轮打点只消费一次。
3. **候选 A 解码窗口与 Anthropic 兜底（`computeTurnTps`）**：
   > 注：本节公式已被文末「oracle 审计修正」节取代，以修正节为准。
   - `canSplitReasoning = firstThinkingAt !== null && firstTextAt !== null && norm.reasoning > 0 && norm.output > norm.reasoning`。
   - 当 `canSplitReasoning` 为真时，窗口起点 `from = firstTextAt`、分子 `n = output - reasoning`；当 `norm.reasoning === 0`（如 Anthropic）或仅有单一段流时，退回全流窗口 `from = firstThinkingAt ?? firstTextAt`、分子 `n = output`。
   - 窗口终点 `end = doneAt ?? lastDeltaAt ?? turnEndedAt ?? Date.now()`，解码时长 `w = end - from`，活跃流跨度 `flow = (lastDeltaAt ?? end) - (firstThinkingAt ?? firstTextAt)`。
   - 无流式 delta（`firstThinkingAt === null && firstTextAt === null`）时回退至 `requestStartedAt -> (doneAt ?? turnEndedAt)` 端到端口径，保持非流式 provider 与既有单测兼容。
4. **四重合理性守卫（任一不过返回 `null` 渲染 `n/a`）**：
   > 注：本节公式已被文末「oracle 审计修正」节取代，以修正节为准。
   - 最小解码窗口：`w >= 100`（ms）；
   - 速率上限：`n * 1000 <= 10000 * w`（即 `<= 10,000 t/s`）；
   - 活跃流占比：`flow * 4 >= w`（活跃 delta 跨度不少于窗口的 25%）；
   - 思考速率比值守卫：`canSplitReasoning && firstTextAt > firstThinkingAt` 时，要求 `reasoningTps <= 20 * textTps`，防止异常思考分桶导致正文窗口失真。

## 被放弃的方案（必填）

- **候选 B（不剥离 reasoning，一律用 `output / (end - firstAnyDeltaAt)`）**：在 OpenAI / Responses 等上报 `reasoning_tokens` 的模型上无法与 magpie 面板的解码速率对齐（实测样本 2 偏差从 137.6 t/s 跌至 65.0 t/s）。
- **只靠 `message_update(type="done")` 记录流结束时刻，不订阅 `message_end`**：Pi `agent-loop` 在流正常结束时直接跳出流循环并发出 `message_end`，随后立即运行工具；若不订阅 `message_end`，工具调用轮的 `doneAt` 为 `null`，且若工具调用后还有尾随事件或落回 `turnEndedAt` 会引发窗口漂移。
- **把 `toolcall_delta` 排除在解码起点之外**：纯工具调用轮（无 `text_delta`，仅 `thinking_delta` + `toolcall_delta` 或纯 `toolcall_delta`）同样消耗 `usage.output` token，忽略 `toolcall_delta` 会导致纯工具轮误走非流式回退或纯思考分支。
- **守卫不过时钳制（clamp）到边界值显示**：会把失真或退化窗口伪装成合法实测速率，违反本仓「不可测即显示 `n/a`，绝不伪造数字」原则。

## oracle 审计修正

基于 magpie 二进制 `decodeOf`（偏移 `28711427`）逆向公式逐项对齐修正：

1. **三分支解码窗口与 `visible` 纯思考判定（致命 1 + 致命 2 + 应修 4）**：
   - 引入首内容时刻 `firstAnyAt = min(firstThinkingAt, firstTextAt)`（仅存在其一时取非空者，对应 magpie `ttft`）。
   - 纯思考可见分支：`visible = reasoning > 0 && !(firstTextAt > 0) && firstThinkingAt >= firstAnyAt && flow > 0 && reasoning <= output`。
   - 分子 `n = (reasoning > 0 && !visible) ? output - reasoning : output`；起点 `from = visible ? firstThinkingAt : (reasoning > 0 ? firstTextAt : firstAnyAt)`，不再使用 `firstThinkingAt ?? firstTextAt` 兜底。
   - 当 `reasoning >= output` 且有正文流（`!visible`）时 `n <= 0`，命中前置守卫 `n > 0` 返回 `null`（`n/a`）；纯思考流 `reasoning > output` 时 `visible = false` 且 `from = firstTextAt = null`，返回 `null`；正文先于思考的交错流（`firstTextAt < firstThinkingAt`）自然落入 `reasoning > 0 && !visible`，取 `from = firstTextAt`、`n = output - reasoning`。
   - 四重守卫严格按 `decodeOf`：`n > 0 && firstAnyAt > 0 && from > 0 && w >= 100 && n * 1000 <= 10000 * w`、`flow > 0 && flow * 4 < w`，以及 20x 守卫 `reasoning > 0 && firstTextAt > 0 && n * (firstTextAt - firstAnyAt) > 20 * reasoning * w`（分母区间使用 `firstTextAt - firstAnyAt` 即 `firstText - ttft`，而非 `firstTextAt - firstThinkingAt`）。
2. **非流式回退逐位一致（观察 6）**：
   - `message_end` 补记 `streamDoneAt` 的条件收紧为 `state.streamDoneAt === null && (state.streamFirstThinkingAt !== null || state.streamFirstTextAt !== null)`（移除 `providerRequestStartedAt !== null`），确保无流式 delta 的非流式路径 `doneAt` 恒为 `null`，回退终点恒为 `turnEndedAt`，与旧版 `Date.now() - t0` 逐位一致。
3. **`flow` 操作数依据补记**：
   - `flow` 操作数采用 `(lastDeltaAt ?? end) - firstAnyAt`（末 delta 到首内容），magpie 二进制中 `flow_ms` 为流持续活跃跨度，两者在 S1 等样本同过守卫；极端尾 delta 早于 `done` 的窗口下本实现更保守（多判 `n/a`），待有 magpie 二进制佐证再校准。

## 来源

- 代码：`extensions/cache-stats.ts`（`normalizeUsage`、`clearTurnTiming`、`computeTurnTps`、`message_update` / `message_end` / `turn_end` 订阅）。
- 测试：`test/cache-stats.mjs`（非流式回退、单次消费含流式戳、`resetRunState` 新字段清零，以及 TTFT 剔除、纯思考流、`canSplitReasoning` 与无 `reasoning` 兜底、工具耗时隔离、四重守卫 + retry 清半截戳 5 组流式回归）。
- 文档：`README.md`、`README.zh-CN.md`。
