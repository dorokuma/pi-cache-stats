---
status: active # active | superseded
superseded_by: ""
supersedes: ""
模块: extensions # extensions | test | docs
---

# 去噱头化整改与更名 pi-cache-stats（1.5.0）

## 一句话结论

- 将扩展从 `pi-cache-guardian` 更名为 `pi-cache-stats`（1.5.0），彻底删除 `skillCompact`、`stripRetention`、`session_shutdown` 低命中率守卫告警、`before_agent_start` 首轮字符数统计及 README 历史跑数噱头表，落盘 custom entry 类型名由 `cache-guard-turn` 改为 `cache-stats-turn`。

## 背景

- 1.3.x–1.4.0 审计整改后，本扩展核心价值已收敛为「按 Pi 净输入口径统计缓存命中率 + 实时 TUI 页脚 + `before_provider_request` 只读前缀变化诊断」。
- 旧名 `pi-cache-guardian` 及残留的可选改写/告警分支（`PI_CACHE_GUARD_SKILL_COMPACT`、`PI_CACHE_GUARD_STRIP_RETENTION`、`PI_CACHE_GUARD` 低命中率告警、首轮 prompt `chars / 4` 粗估、README 未复核历史跑数表）仍带有「主动守护/改写省钱」的历史包袱，与纯观测统计定位不符。

## 决策

1. **全面更名 `pi-cache-stats`（1.5.0）**：
   - 包名改为 `pi-cache-stats`，扩展文件改为 `extensions/cache-stats.ts`，命令改为 `/cache-stats`，日志标签改为 `cache-stats`。
   - 环境变量前缀统一为 `PI_CACHE_STATS_`（`PI_CACHE_STATS_FOOTER`、`PI_CACHE_STATS_PREFIX_DIAGNOSTICS`、`PI_CACHE_STATS_VERBOSE` 及测试变量 `PI_CACHE_STATS_TEST_SDK`、`PI_CACHE_STATS_CORE`、`PI_CACHE_STATS_BENCH*`），不兼容读取旧变量名。
2. **去噱头化删减**：
   - 删除 `skillCompact` 技能 XML 改写全链（`AVAILABLE_SKILLS_BLOCK` / `VERBOSE_SKILL_ITEM` / `skillKey` / `compactRecognizedSkills` / `maybeRewritePrompt` / `escapeXml` / `unescapeXml` / `BuildSystemPromptOptions`）。
   - 删除 `stripRetention` 旧字段剥离全链（`PI_CACHE_GUARD_STRIP_RETENTION` 与 `payload.prompt_cache_retention` 删除逻辑）。
   - 删除两个边缘链：`session_shutdown` 低命中率守卫告警链（`PI_CACHE_GUARD` / `PI_CACHE_GUARD_THRESHOLD` / `session_shutdown` 钩子 / `showStats` 中 `Cache guard` 行）与 `before_agent_start` 首轮 prompt 字符数记录链（`firstPromptChars` / `estimateTokens` / `before_agent_start` 钩子 / `showStats` 中 `First-turn prompt` 行）。
   - 删除 README / README.zh-CN 中对应章节、已弃用环境变量表与未复核历史跑数表。
3. **落盘条目类型名迁移**：
   - `agent_end` 中 `appendCustomEntry` 的 `customType` 由 `cache-guard-turn` 改为 `cache-stats-turn`。
   - 扩展运行期仅对 `type === "message" | "branch_summary" | "compaction"` 聚合计算，不回放 custom entry；本机历史会话 JSONL 中存量 4687 条 `cache-guard-turn` 条目的就地替换在部署阶段单独执行。

## 被放弃的方案（必填）

- **候选名 `pi-cache-observer` / `pi-cache-watch`**：不如 `pi-cache-stats` 直接体现缓存统计与诊断面板的核心心智，且命令输出、页脚与笔记已广泛采用 stats 语义，故放弃 `observer` 与 `watch`。
- **双前缀兼容读取旧环境变量（`PI_CACHE_GUARD_*` / `PI_CACHE_GUARDIAN_*`）**：单用户自用扩展无外部兼容负担，保留旧前缀徒增分支与文档噪音，故一步到位切至 `PI_CACHE_STATS_`。
- **保留 `session_shutdown` 告警或首轮 prompt 字符数统计**：首轮 `chars / 4` 并非真实 token 且已被只读前缀诊断覆盖，`session_shutdown` 结束告警实战价值低且延续「guardian 守卫」伪概念，故彻底删除。

## 来源

- 改动：`extensions/cache-stats.ts`、`test/cache-stats.mjs` 等测试套件、`package.json`、`integrations/pi/install.sh`、`README.md`、`README.zh-CN.md`、`AGENTS.md`、`docs/`（分支 `feature/rebrand-cache-stats`，基线 `5110f9e`）。
- Oracle 应修项收口：精简 `.env.example` 为现存三个 `PI_CACHE_STATS_*` 变量；修正 `AGENTS.md` 历史备份文件名与删除语义；`integrations/pi/install.sh` 同步后自动 `rm` 清理同目录 `cache-guardian.ts` 与 `cache-guardian.ts.bak-*` 残留。
- 任务标记：[MARK-WORKER-REBRAND-CACHE-STATS-01]、[MARK-WORKER-FIX-ENV-DEPLOY-01]。
