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
