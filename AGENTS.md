# Agent 协作指南

档位：L1

## 铁律
1. 检查入口：`make check`——内部先执行 `node --check extensions/cache-stats.ts`，再串行跑全部 19 个离线单测（`test/*.mjs`）；也可单跑 `node --import ./test/sdk-loader.mjs test/<name>.mjs`。
   - SDK 依赖：干净克隆不含 `node_modules`，须 `PI_CACHE_STATS_TEST_SDK=/path/to/@earendil-works/pi-coding-agent make check` 指定宿主 SDK（包目录或 `dist/` 均可）；`test/sdk-loader.mjs` 自动解析同级 `@earendil-works/pi-tui`，可用 `PI_CACHE_STATS_TEST_TUI` 覆盖。已有 `node_modules` 的工作副本可不设。兼容已验证 SDK 0.84.2 / 0.85.1。
2. 提交规范、门禁与收口按 /root/.pig/agent/SYSTEM.md §4 执行。
3. 架构决策、规范变更、临时 workaround 踩坑须记 `.agents/notes/`。
4. 扩展生效位置：本仓库 `extensions/cache-stats.ts` 是源文件，改了不同步到 pi 扩展目录不生效（见「生效位置」）；同步后须重载/重启 pi。

## 生效位置

- 实际生效文件：`~/.pi/agent/extensions/cache-stats.ts`（即 `/root/.pi/agent/extensions/cache-stats.ts`）。
- 本仓库 `extensions/cache-stats.ts` 只是源文件：改完不同步到上述目录**不会生效**。
- 该扩展目录在 `/root/.pi/agent` 仓库中已被 `.gitignore` 忽略（不入版本库），同步动作本身不需要提交。
- 同步步骤——「本仓源文件 → 本机部署目录」这条链路的入口（替代历史手工 `cp`）：

```bash
bash integrations/pi/install.sh
```

- 上述入口只管「仓库源文件 → 本机部署目录」这一链路。
- **发版状态**：本仓库 TS 扩展已由 `pi-extensions/go/cache-stats` 接替，停止 npm 发版；不再发布 npm 包。
- 脚本契约：幂等（目标 md5 与源一致 → 报告 `unchanged`、不重写、不动 mtime）；`PI_EXT_DEST` 可覆盖目标（须为绝对路径，且优先于 `HOME`）；`md5sum` 缺失 / `HOME` 未设置 / 目标为目录均显式 `FAILED` 并非零退出。
- Pi 只加载以 `.ts`/`.js` 结尾的扩展文件，`.ts.bak-*` 不会被加载；但仍不要把 bak 放在 `extensions/` 目录。
- 生效时机：pi 在启动时加载扩展，同步后需重载/重启 pi 才生效（脚本结尾亦有提示）。
- 校验：以 `bash integrations/pi/install.sh` 输出的 `unchanged`/`changed` 与两侧 md5 一致为准；不在此文档写死具体 md5 与字节数（必然过时，只会制造「文档 ↔ 真实状态」漂移）。安装命令另见 [README.md](README.md)。

## 索引
- 现状文档：[docs/testing-methodology.md](docs/testing-methodology.md) · [docs/audit-remediation.md](docs/audit-remediation.md)
- 决策笔记：[.agents/notes/](.agents/notes/)
- 写完笔记刷新索引：`scripts/notes-index.sh`（本地生成 INDEX.md，不入 git）

## 关联仓库
- herdsman（同为 Pi 生态插件/观测向）
## Release Policy / 发布规范

本节是本仓库发版的强制规则。仓库已有的更具体版本、构建或发布渠道规则优先，但不得降低以下底线。

1. **版本与变更记录**：遵循 Semantic Versioning，正式版本使用 `vX.Y.Z`。破坏性变更升 MAJOR，新功能升 MINOR，兼容修复升 PATCH。任何用户可见行为、运行时/API/包接口、依赖、安全性或分发产物变化，都必须在同一发版提交中更新版本元数据并写入 CHANGELOG/Release Notes；纯文档且不产生可分发产物时可免升版，但须在规则或 Release Notes 中明确说明。
2. **发布门禁**：发版前工作树必须干净，版本号、CHANGELOG 与发布说明必须一致；必须运行仓库规定的测试、构建、lint、类型检查及必要的安全检查，且全部通过。若仓库提供 `release-check`、`make release-check`、版本检查脚本或同等门禁，必须原样通过，不得绕过。
3. **发布顺序**：先提交并推送发布提交到目标分支 → 在该发布提交上创建 Tag（默认使用带注解的 `git tag -a vX.Y.Z -m "vX.Y.Z"`；仅当现有发布工具明确要求轻量 Tag 时可例外）→ 推送 Tag → 创建**非草稿** GitHub Release → 再发布 npm、PyPI、容器镜像等关联分发渠道。不得只推分支或只打 Tag 就宣称发版完成。
4. **GitHub Release 产物**：标题使用 `vX.Y.Z`，正文必须包含实质性变更摘要、升级/破坏性变更说明及验证结果；二进制、安装包、插件包等适用产物必须作为 Release assets 上传，并提供校验和（如适用）。**Tag 本身不等于完整发版，必须同时存在可访问的 GitHub Release。**
5. **发布后验收**：至少执行并确认 `git ls-remote --tags origin refs/tags/vX.Y.Z`、Tag 指向发布提交、`gh release view vX.Y.Z` 可访问且不是 draft；若发布到包仓库/镜像仓库，还必须核验对应版本、摘要或安装链接可用。
6. **不可变性**：已发布 Tag 不得复用、移动或删除，不得 force push 发布分支或 Tag，不得从未提交、未经测试或未通过门禁的树发布。发布后发现问题须通过新的 patch 版本修复，禁止覆盖历史 Release。
7. **例外必须显式化**：归档、已停用、被替代、仅文档或无可分发产物的仓库，必须在项目规则中明确写出“不发新版本”及历史 Tag/Release 的处置方式；例外不能用于绕过上述发布闭环。

### Repository-specific release contract

- 本仓 TS 扩展已被 `pi-extensions/go/cache-stats` 替代并停止 npm 发版：不再发布新 npm 版本；历史 Tag/Release 只读保留。
- **当前状态**：已被替代并停止 npm 发版：不再发新版本。不得将归档/替代状态伪装成新版本发布。
