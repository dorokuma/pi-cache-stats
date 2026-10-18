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

1. **a) 测试内部旧名标识残留（后续清理批次统一改）**：
   - `test/helpers.mjs:6` 的 `GUARDIAN_PATH` 常量名、`registerFactory(name="guardian")` 默认参数名，以及 `test/agent-session.mjs:32` 与 `test/comparison.mjs:131` 的临时目录前缀 `guardian-fix-*` 等测试内部标识仍沿用旧名；不涉及对外契约，后续测试清理批次统一改名。
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
