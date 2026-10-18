---
status: active # active | superseded
superseded_by: ""
supersedes: ""
模块: "" # extensions | test | docs
---

# 缓存统计修复残留观察项（followup）

## 一句话结论

四项观察均已核对源码并判定为非阻断：(a) fallback 与 recordTurnUsage 对 state.snapshot 重复累加已排除；(b) reset 后 Per-turn 与 footer ◇/◆ 存在口径差异，但仅影响展示；(c) 自动 retry/compaction/continuation 会产生多 run 使轮号跳变，属宿主既有行为；(d) 无 agent_start 的 agent_end 路径会多记一条 0 值轮记录，无重复计数风险。

## 背景

前次修复（b3446b3）统一了 cache stats display 与 fallback accumulation。本次按任务要求逐条核对源码，确认残留观察项的范围与阻断性。

## 决策

- 四项观察均记录为 followup note，不进入本次修复范围。
- (a) 已排除，无需后续处理。
- (b)/(c)/(d) 均为非阻断的展示或宿主行为差异，危害限于展示或已有语义，不改变本次修复的正确性。
> 注（2026-10-17）：(b)、(c)、(d) 观察项经复核判定不做，已清理。

## 被放弃的方案（必填）

无。本次仅记录观察，未对代码作出任何改动。

## 观察与证据

### a) 已排除：fallback 与 recordTurnUsage 对 state.snapshot 重复累加

**结论：已排除，两者互斥。**

证据（extensions/cache-guardian.ts）：
- `recordTurnUsage`（约 L659-668）在累加 `state.liveRun` 的同时也累加 `state.snapshot`：
  ```ts
  state.liveRun.input += norm.input;
  state.snapshot.totalInput += norm.input;
  // ... 其余字段同理
  ```
- `agent_end` 中的 fallback（约 L1855-1867）仅在 `inp === 0 && outp === 0 && cr === 0 && cw === 0 && event?.messages?.length` 时触发，即 liveRun 全零。
- `liveRun` 在 `agent_start`（约 L1843）与 `agent_end` 末尾（约 L1887）被重置为 `emptyLiveRun()`。

因此：若 `recordTurnUsage` 已写入，liveRun 非零，fallback 不会触发；若 fallback 触发，说明本 run 内无 `recordTurnUsage` 写入，两者互斥，不存在重复累加。


## 来源

- 前次修复 commit b3446b3（fix: unify cache stats display and fallback accumulation）
- 仓库源码 `extensions/cache-guardian.ts`（约 L659-668、L1843-1887、L2016-2096）
- 依赖 `@earendil-works/pi-agent-core@0.84.2` 的 `dist/agent-loop.js`、`dist/agent.js`（通过 pnpm 安装后核对）
- 任务说明中给出的行号与结论
