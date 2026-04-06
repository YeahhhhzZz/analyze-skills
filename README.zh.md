# analyze-skills（中文文档）

English documentation: [README.md](README.md)

一个 Claude Code 插件，用于分析已安装的 Claude Code 技能，识别功能重叠或重复的技能组以及存在**矛盾指令**的技能对，并将结果呈现给用户进行人工审查。**无需 API Key**——分析直接在 Claude Code 会话内完成。

## 安装

```
/plugin marketplace add YeahhhhzZz/analyze-skills
/plugin install analyze-skills@YeahhhhzZz-analyze-skills
```

## 使用

安装完成后，在任意 Claude Code 会话中调用：

```
/analyze-skills
```

Claude 会分析当前会话 context 中已加载的全部技能列表，将功能重叠的技能分组列出，同时标记存在矛盾指令的技能对。

**输出示例：**

```
## Overlap Group 1: Meeting Notes
- lark-vc                        视频会议记录和纪要
- lark-minutes                   录音/妙记纪要
- lark-workflow-meeting-summary  会议纪要工作流
Reason: 三者均处理会议产物，触发场景高度重叠。

---

## Conflicts

🔴 **tdd-guide** vs **quick-fixes** (testing-strategy)
tdd-guide 要求先写测试；quick-fixes 建议小改动跳过测试。

---
Found 3 overlap groups and 1 conflict across 7 skills. All decisions left to human.
```

所有决定（保留、删除、修改）均由用户自行做出。

## 工作原理

每次 Claude Code 会话启动时，已安装的技能列表会自动通过 system context 注入到 Claude 的上下文中。该技能指示 Claude 对列表进行语义聚类，输出重叠组——无需外部 API 调用，无额外依赖。

## CLI（可选）

如需在 Claude Code 之外使用，也提供独立的 Node.js 命令行工具：

```bash
# 需要 ANTHROPIC_API_KEY
npx analyze-skills
npx analyze-skills --output report.md
```

源码见 `bin/` 和 `src/` 目录。

## 开源协议

MIT
