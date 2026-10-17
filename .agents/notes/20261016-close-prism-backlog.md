---
status: active # active | superseded
superseded_by: ""
supersedes: "20261004-pi-ext-sync-install-script.md" # 条款级：仅闭合其中「遗留清单 #2 prism.ts 等手工同步」条目，旧笔记主体契约仍有效
模块: docs # extensions | test | docs
---

# 闭合 20261004-pi-ext-sync-install-script.md 中 prism.ts 扩展同步遗留项

## 一句话结论

- 声明历史笔记 `.agents/notes/20261004-pi-ext-sync-install-script.md:44`（「遗留清单」第 2 条）中关于 `prism.ts`「仍为手工同步，归属各自源仓库」的遗留项已于 2026-10-16 彻底闭合：`prism` 扩展已从联邦分发中枢 `/root/workspace/pi-extensions` 移除、部署副本 `/root/.pi/agent/extensions/prism.ts` 已删除、`prism` 项目已归档并完成本机运行时清除；旧笔记文件按不可篡改历史规范保持原样不改。

## 背景

- `.agents/notes/20261004-pi-ext-sync-install-script.md:42-44` 在 2026-10-04 记录本仓 `integrations/pi/install.sh` 落盘时，于「## 遗留清单」第 2 条写有现在时状态描述：
  > `ctxmode.ts` / `prism.ts` / `herdr-agent-state.ts` / `herdsman-pi.ts` / `auto-continue.ts` / `no-tables.ts` 仍为手工同步，归属各自源仓库，本仓库管不到。
- 截至 2026-10-16，`prism` 项目已被 MAGPIE 替代并完成全生命周期退役清理，上述旧笔记中的现在时遗留描述若无显式闭合记录，会被复核判定为未销账的遗留待办。
- 按 `.agents/notes/README.md`「只增不改、不重写历史笔记内容」规范及本次任务禁令，严禁修改 `.agents/notes/20261004-pi-ext-sync-install-script.md` 文件本身，须以新增闭合笔记建立条款级 `supersedes`/闭合关系。

## 决策

- **条款级闭合声明（关联旧笔记 `.agents/notes/20261004-pi-ext-sync-install-script.md:44`）**：
  1. **`prism` 扩展已从分发中枢移除**：`/root/workspace/pi-extensions` 已于提交 `21411bd`（`chore(extensions): remove archived prism extension`，任务 `[MARK-PRISM-EXT-REMOVE-20261016]`）删除 `extensions/prism/` 权威源及 `federated/registry.json` 登记，全机纳管扩展数由 12 收敛为 11。
  2. **部署目录副本已删除**：`/root/.pi/agent/extensions/prism.ts`（删除前 md5 `e1c6c8debe8cc8a77425ca69f345d35d`，7725 字节）已于合入收口轮次（任务 `[MARK-PRISM-EXT-CLOSE-20261016]`）删除。
  3. **`prism` 项目已归档并完成本机清除**：GitHub 远端 `dorokuma/prism` 已归档封存；本机仓库目录 `/root/workspace/prism`、二进制 `/usr/local/bin/prism` 与运行时配置 `/var/lib/prism/` 已于 2026-10-16 彻底清除，全局台账 `/root/workspace/PROJECTS.md:42` 已更新为「已归档清除」墓碑行。因此 `prism.ts` 同步漂移遗留项已因标的物退役而自然终结闭合。
  4. **同条其余扩展现状备查**：`.agents/notes/20261004-pi-ext-sync-install-script.md:44` 同行列举的其余扩展亦已由联邦中枢 `/root/workspace/pi-extensions` 纳管（`ctxmode.ts` 已在 `/root/workspace/ctxmode` 提炼 `integrations/pi/install.sh` 并作为 federated 项级联；`auto-continue.ts`、`no-tables.ts`、`herdsman-pi.ts`［仓内名 `herdsman-bridge`］已作为 hosted 项由 `pi-extensions` 逐字节同步；`herdr-agent-state.ts` 作为 `herdr` 二进制托管的 external 只读巡检项）。
- **闭合关系界定**：本笔记在 frontmatter 中以条款级 `supersedes: "20261004-pi-ext-sync-install-script.md"` 指向旧笔记，仅闭合其「遗留清单」第 2 条（第 42–44 行），不废止该笔记关于本仓 `integrations/pi/install.sh` 与 `pnpm sync` 的主体契约与其余有效内容；旧笔记文件字节与 mtime 保持一字不改。
- **索引刷新**：运行 `bash scripts/notes-index.sh` 刷新本地 `.agents/notes/INDEX.md`（受 `.gitignore` 忽略，不入版本库）。

## 被放弃的方案（必填）

- **方案 A：直接编辑 `.agents/notes/20261004-pi-ext-sync-install-script.md:44` 删去 `prism.ts` 或改写为过去时**。放弃理由：违反 `.agents/notes/README.md`「不重写历史笔记内容」规范与本次任务「严禁修改任何历史笔记正文」硬约束。
- **方案 B：修改旧笔记 frontmatter 将整篇 `20261004-pi-ext-sync-install-script.md` 标为 `status: superseded`**。放弃理由：该笔记的主体决策（`integrations/pi/install.sh` 幂等同步契约与 `pnpm sync` 入口）至今仍是本仓现行有效契约，整篇标为 `superseded` 会误导后续协作者以为同步脚本已废弃，且同样会触碰旧笔记文件。

## 来源

- 关联旧笔记：`.agents/notes/20261004-pi-ext-sync-install-script.md:44`
- 关联外部证据：`/root/workspace/pi-extensions` 提交 `21411bd` 及笔记 `.agents/notes/20261016-remove-prism-extension.md`、全局台账 `/root/workspace/PROJECTS.md:42`
- 任务标记：`[MARK-PRISM-BACKLOG-20261016]`；工作分支：`chore/close-prism-backlog`

## 勘误（2026-10-16，去重轮后补）

- 2026-10-16 晚间的去重轮（commit `296ebb3`）对旧笔记 `.agents/notes/20261004-pi-ext-sync-install-script.md` 做了就地行内替换（frontmatter `superseded_by`、第 41/45/49-50 行加 `[本仓特有]` 标注与指针），本笔记原「原样不改/严禁修改」表述（第 12 行「旧笔记文件按不可篡改历史规范保持原样不改」、第 19 行「严禁修改 `.agents/notes/20261004-pi-ext-sync-install-script.md` 文件本身」及第 28 行同类表述）仅代表本闭合笔记落盘当时的约束，不适用于后续独立授权的去重轮；旧笔记中 prism 相关条目（第 42-44 行，尤其 `:44` 的 `prism.ts` 手工同步表述）未在去重轮中改动，本笔记对 `:42-44`/`:44` 的行号引用仍有效。
