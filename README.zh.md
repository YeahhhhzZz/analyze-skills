# analyze-skills（中文文档）

English documentation: [README.md](README.md)

一个 Node.js 命令行工具和 Claude Code 技能，用于扫描本地安装的 Claude Code 技能，通过 Claude AI（Haiku）识别功能重叠或重复的技能组，并将结果呈现给用户进行人工审查。工具不会自动执行任何操作——所有决定由你来做。

## 环境要求

- Node.js 18+
- `ANTHROPIC_API_KEY` 环境变量

## 安装（本地开发）

```bash
npm install
```

## 使用方式

### 命令行（CLI）

```bash
# 扫描技能并在终端打印重叠组
npx analyze-skills

# 扫描并同时保存 Markdown 报告
npx analyze-skills --output report.md

# 显示版本号
npx analyze-skills --version
```

运行前请先设置 API 密钥：

```bash
export ANTHROPIC_API_KEY=sk-...
npx analyze-skills
```

### Claude Code 技能

将 `skills/analyze-skills/SKILL.md` 安装到你的 Claude Code 技能目录，然后在 Claude Code 会话中调用：

```
/analyze-skills
```

如果未安装 CLI，该技能会自动回退到内联 LLM 分析模式。

## 工作原理

1. 扫描 `~/.claude/skills/*/SKILL.md` 和 `~/.claude/plugins/installed_plugins.json`，收集所有本地安装的技能。
2. 将技能元数据发送给 Claude Haiku API，由其对功能重叠或重复的技能进行语义聚类。
3. 以彩色分组输出的形式在终端展示结果。
4. 如果指定了 `--output`，则额外写入一份 Markdown 报告。

保留、合并或删除技能的所有决定由你自行做出。

## 技术栈

Node.js ESM · `@anthropic-ai/sdk` · `chalk` · `commander` · `gray-matter` · `vitest`
