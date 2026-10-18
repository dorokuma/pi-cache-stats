---
status: followup # active | superseded | followup
date: 2026-10-18
superseded_by: ""
supersedes: ""
模块: "extensions, test" # extensions | test | docs
---

# TPS 流式解码窗口审计遗留项（2026-10-18）

## 一句话结论

- 记录 TPS 流式解码窗口（magpie `decodeOf` 对齐）审计中的非阻断 consider 遗留项（日期 2026-10-18，状态 `followup`），供后续测试重构与观察批次跟进。

## 背景

- `feature/rebrand-cache-stats` 分支已完成 Footer TPS 流式解码窗口改造、oracle 审计修正与收尾加固（`typeof ame.delta === "string" && ame.delta !== ""`）。
- reviewer 与 oracle 审计确认以下 consider 项不阻塞本轮交付，按规范落盘归档。

## 决策

1. **a) 测试 mock 样板提取 helper（低优先重构）**：
   - `test/cache-stats.mjs` 中多组 TPS 单测重复构造 `makeCtx`、`emitTurn`、`fireTurn` 及 `Date.now` 桩函数样板；当前各用例自包含易读，后续可在测试重构批次按需提取共享 helper。
2. **b) `message_update` `done` 事件无 delta 前置（方向无害可接受）**：
   - `extensions/cache-stats.ts` 的 `message_update` 在 `t === "done"` 时直接记录 `state.streamDoneAt = now`，未像 `message_end` 那样前置检查 `streamFirstThinkingAt !== null || state.streamFirstTextAt !== null`。因 Pi `agent-loop` 不转发 `message_update(type="done")`，且即便极端场景下无 delta 触发 `done`，非流式回退分支 `doneAt ?? turnEndedAt` 仍可正常工作，方向无害、可接受。
3. **c) rebrand 轮遗留项引用**：
   - 测试内部旧名标识（`GUARDIAN_PATH`、`guardian-fix-*` 等）与 `docs/audit-remediation.md` 历史环境变量漂移已记录于 [20261018-rebrand-leftovers.md](20261018-rebrand-leftovers.md)，本轮不重复展开。

## 被放弃的方案（必填）

- **在本轮 TPS 收尾 commit 中顺带大改 `test/cache-stats.mjs` 公共夹具**：会引入无关测试结构大 diff，不利于聚焦核验流式解码窗口与 `decodeOfRef` 对拍逻辑，故归入 `followup` 低优先处理。

## 来源

- 分支：`feature/rebrand-cache-stats`（关联笔记：[20261018-tps-streaming-decode.md](20261018-tps-streaming-decode.md)、[20261018-rebrand-leftovers.md](20261018-rebrand-leftovers.md)）。
- 关联文件：`extensions/cache-stats.ts`、`test/cache-stats.mjs`。
- 任务标记：[MARK-WORKER-TPS-FINAL-COMMIT-01]。
