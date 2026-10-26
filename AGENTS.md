# Agent 协作指南

## 铁律
1. 构建与类型检查：`pnpm build`；全量校验：`pnpm check`；单元测试：`pnpm test`。
2. 提交规范——commit message 须过全局 commit-msg hook：Conventional Commits 类型白名单、≤72 字、冒号后一空格、禁噪声词与密钥。
3. 架构决策、规范变更、临时 workaround 踩坑须记 `.agents/notes/`。
4. 扩展生效位置：本仓库 `extensions/cache-stats.ts` 是源文件，改了不同步到 pi 扩展目录不生效（见「生效位置」）；同步后须重载/重启 pi。

## 生效位置

- 实际生效文件：`~/.pi/agent/extensions/cache-stats.ts`（即 `/root/.pi/agent/extensions/cache-stats.ts`）。
- 本仓库 `extensions/cache-stats.ts` 只是源文件：改完不同步到上述目录**不会生效**。
- 该扩展目录在 `/root/.pi/agent` 仓库中已被 `.gitignore` 忽略（不入版本库），同步动作本身不需要提交。
- 同步步骤——「本仓源文件 → 本机部署目录」这条链路的入口（替代历史手工 `cp`）：

```bash
bash integrations/pi/install.sh   # 或 pnpm sync
```

- 上述入口只管「仓库源文件 → 本机部署目录」这一链路；另一条安装路径 `pi install npm:pi-cache-stats`（见 [README.md](README.md)）装的是 **npm 发布版**，不经本脚本——改了仓库源文件后对本脚本报 `unchanged` 不代表 npm 安装版本已更新，反之 npm 更新也不反映到源文件。
- 脚本契约：幂等（目标 md5 与源一致 → 报告 `unchanged`、不重写、不动 mtime）；`PI_EXT_DEST` 可覆盖目标（须为绝对路径，且优先于 `HOME`）；`md5sum` 缺失 / `HOME` 未设置 / 目标为目录均显式 `FAILED` 并非零退出。
- Pi 只加载以 `.ts`/`.js` 结尾的扩展文件，`.ts.bak-*` 不会被加载；但仍不要把 bak 放在 `extensions/` 目录。
- 生效时机：pi 在启动时加载扩展，同步后需重载/重启 pi 才生效（脚本结尾亦有提示）。
- **npm 发布（npm publish）**：npm 发布由本机 agent（狗狗/主代理）全权执行，用户不参与：npm 已登录 `dorokuma`，`pi-cache-stats` 为新首发包名。发布前确认 worktree 在 `main` 且 `pnpm check` 全绿；执行 `npm publish` 后用 `npm view pi-cache-stats version` 验证上线。旧包名 `pi-cache-guardian`（v1.0.x，原作者 icefairy）非本仓所有，不触碰。发布节奏由用户一句话授权即可，无需用户提供凭据或手动操作。
- 校验：以 `bash integrations/pi/install.sh`（或 `pnpm sync`）输出的 `unchanged`/`changed` 与两侧 md5 一致为准；不在此文档写死具体 md5 与字节数（必然过时，只会制造「文档 ↔ 真实状态」漂移）。安装命令另见 [README.md](README.md) 的 Direct copy 一节。

## 索引
- 现状文档：[docs/testing-methodology.md](docs/testing-methodology.md) · [docs/audit-remediation.md](docs/audit-remediation.md)
- 决策笔记：[.agents/notes/](.agents/notes/)
- 写完笔记刷新索引：`scripts/notes-index.sh`（本地生成 INDEX.md，不入 git）

## 关联仓库
- herdsman（同为 Pi 生态插件/观测向）
