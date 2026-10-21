---
status: followup # active | superseded | followup
date: 2026-10-18
superseded_by: ""
supersedes: ""
模块: "extensions, test, docs" # extensions | test | docs
---

# pi-cache-stats 更名与去噱头化遗留项（2026-10-18）

## 一句话结论

- 记录 `pi-cache-stats`（1.5.0）更名与去噱头化整改的 5 条非阻断 consider 遗留项（日期 2026-10-18，状态 `followup`），供后续测试标识清理与文档维护批次跟进。

## 背景

- `feature/rebrand-cache-stats` 分支已完成 `pi-cache-guardian` → `pi-cache-stats` 重命名、无操作/噱头路径移除及 `.env.example` / `install.sh` 收口。
- C 档门禁审查与补证核验确认 5 条非阻断 consider 项不影响本轮功能与对外契约，按规范落盘为 `followup` 笔记归档。

## 决策

1. **a) 测试内部旧名标识残留（已于 2026-10-19 清理闭环）**：
   - `test/helpers.mjs:6` 的 `GUARDIAN_PATH` 常量名、`registerFactory(name="guardian")` 默认参数名，以及 `test/agent-session.mjs:32` 与 `test/comparison.mjs:131` 的临时目录前缀 `guardian-fix-*` 等测试内部标识仍沿用旧名；不涉及对外契约，后续测试清理批次统一改名。
   - **闭环记录（2026-10-19，分支 `chore/clean-rebrand-test-leftovers`，`[MARK-WORKER-PI-CACHE-20261019]`；2026-10-21 补注，`[MARK-WORKER-PI-CACHE-NOTES-20261021]`）**：本次实际统一更新的范围为 `test/helpers.mjs` 的 `GUARDIAN_PATH`→`CACHE_STATS_PATH` 与 `registerFactory(factory, name = "guardian")`→`name = "cache-stats"` 默认工厂名、`test/agent-session.mjs` 的 `guardianFactory`→`cacheStatsFactory` 与 `guardian-from-host-prompts`→`cache-stats-from-host-prompts`、`test/comparison.mjs` 与 `test/cache-stats.mjs` 与 `test/prefix-diagnostics.mjs` 与 `test/prefix-r9-harness.mjs` 的 `GUARDIAN_PATH` 引用点（含 `fresh()` 默认工厂名 `"guardian"`→`"cache-stats"`）、以及 `test/helpers.mjs`、`test/agent-session.mjs`、`test/comparison.mjs` 的 `guardian-fix-*`→`cache-stats-fix-*` 临时目录前缀，本条目显式点名项已清理闭环。补注精度说明：`guardianFactory` 类变量仅在 `test/agent-session.mjs` 改名，列名文件 `test/cache-stats.mjs`（第 17、28 行附近）与 `test/prefix-diagnostics.mjs`（第 20、42 行附近）仍使用 `guardianFactory` / `guardianHref`；其余 `guardianFactory` 类变量名、`tested guardian:` 日志串、含旧品牌词的 PASS 文案与断言消息约 130 处留待后续批次统一清理（见文末独立 Followup 小节）。
2. **b) 历史整改文档环境变量引用漂移（下轮文档维护时更新）**：
   - `docs/audit-remediation.md:26,28` 中 F07 / F08 / F10 仍引用已删除的旧环境变量名，存在历史文档漂移，留待下轮文档维护时统一更新或加注历史背景说明。
3. **c) 源码中性注释残留（可不改）**：
   - `extensions/cache-stats.ts:742` 处「mode guard」注释属于通用编程语境下的模式守卫（早退判断）中性语义残留，非旧版缓存命中率守卫概念，可保持不改。
4. **d) 安装脚本自定义目标目录同目录清理边缘语义（已知可接受）**：
   - `integrations/pi/install.sh:92-95` 在 `PI_EXT_DEST` 指向非扩展目录时，仍会清理该目标所在同目录下的同名旧文件 `cache-guardian.ts` 与 `cache-guardian.ts.bak-*`；`AGENTS.md` 已明示该 `rm` 契约，属已知可接受的边缘语义。
5. **e) 检索范围历史说明（以 verifier 补证轮 J8 为准）**：
   - worker 修复轮的 `rg` 零匹配结论仅限定于 `.env.example` 单文件范围；全仓旧名残留盘点以 verifier 补证轮 J8 的全仓核验结果为准。

## 被放弃的方案（必填）

- **在本次重命名 commit 中顺带修改全部测试内部变量名与历史整改档案**：会扩大单次重构 diff 面并模糊历史审计条目的原始上下文，故保持最小变更边界，归入 `followup` 后续批次处理。

## 来源

- 分支：`feature/rebrand-cache-stats`（关联笔记：`20261018-rebrand-cache-stats.md`）。
- 关联文件：`test/helpers.mjs:6`、`test/agent-session.mjs:32`、`test/comparison.mjs:131`、`docs/audit-remediation.md:26,28`、`extensions/cache-stats.ts:742`、`integrations/pi/install.sh:92-95`、`.env.example`。
- 任务标记：[MARK-WORKER-COMMIT-REBRAND-01]。

## Followup：测试内部其余旧名标识后续批次清理跟踪（2026-10-21）

- **出处**：分支 `chore/clean-rebrand-test-leftovers` 审查发现（1 条 should fix 精度补注与 3 条 consider 留痕，任务标记 `[MARK-WORKER-PI-CACHE-NOTES-20261021]`）。
- **问题**：
  1. 原条目 1(a) 为开放式表述（「等测试内部标识仍沿用旧名」），首轮仅清理了点名的 `GUARDIAN_PATH`、默认工厂名、`guardian-fix-*` 及 `test/agent-session.mjs` 内的 `cacheStatsFactory` / `cache-stats-from-host-prompts`，若直接标记 1(a) 整体闭环会导致其余约 130 处测试内部旧标识失去跟踪锚点。
  2. 已改文件 `test/cache-stats.mjs`（第 17、28 行附近）与 `test/prefix-diagnostics.mjs`（第 16–20、42、538 行附近）内部仍残留 `guardianFactory` / `guardianHref`、`guardian import/path` 日志串、`F01 guardian keeps…` 等 PASS 文案与 `disabled guardian…` 等断言消息。
  3. `test/prefix-r9-harness.mjs` 的 `loadUnderTest()` 返回键 `guardianFactory`（第 38、41 行）及 `guardian path/import` 日志串（第 36–37 行）是其余未改动测试脚本解构 `guardianFactory` 与输出 `tested guardian:` 日志串的根依赖。
- **建议（切入点、范围与不阻断理由）**：
  - **切入点**：`test/prefix-r9-harness.mjs` 的 `loadUnderTest()` 返回键 `guardianFactory` 是 15 个未改动文件旧标识的根依赖，后续批次应以该键为切入点一次性联动改名（避免逐文件改名两次）。
  - **范围**：其余 `guardianFactory` 类变量名/日志串/断言文案约 130 处（含 `test/cache-stats.mjs`、`test/prefix-diagnostics.mjs` 等已改文件内部残留）、`F01 guardian keeps…` 等 PASS 文案与 `disabled guardian…` 等断言消息、`guardian import/path` 与 `tested guardian:` 日志串。
  - **不阻断理由**：全部为测试内部标识，无对外契约，19 个测试脚本全绿证明零行为影响；本批遵循最小 diff 纪律。
- **后续处置条件**：在后续专门的测试内部命名清理批次中，以 `test/prefix-r9-harness.mjs` 的 `loadUnderTest()` 返回键为核心切入点，一次性联动清理上述约 130 处测试内部变量名、日志串、PASS 文案与断言消息，并在 `pnpm check`（含全部 19 个测试脚本）全绿后闭环本跟踪条目。
