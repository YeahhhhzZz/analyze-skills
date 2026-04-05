import { writeFile } from 'fs/promises';
import chalk from 'chalk';

const SEVERITY_ICON = { high: '🔴', medium: '🟡' };
const SEVERITY_LABEL = { high: 'High', medium: 'Medium' };
const SEVERITY_COLOR = { high: chalk.red, medium: chalk.yellow };

export function toMarkdown({ overlaps, conflicts }, skills) {
  const lines = [];

  // Overlaps table
  lines.push('## Overlapping Skills');
  lines.push('');
  if (overlaps.length === 0) {
    lines.push('No overlapping skills found.');
  } else {
    lines.push('| Group | Skills | Reason |');
    lines.push('|-------|--------|--------|');
    for (const group of overlaps) {
      const skillList = group.skills.map(s => `\`${s}\``).join(', ');
      const reason = group.reason.replace(/\|/g, '\\|');
      lines.push(`| ${group.group} | ${skillList} | ${reason} |`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  // Conflicts table
  lines.push('## Conflicts');
  lines.push('');
  if (conflicts.length === 0) {
    lines.push('No conflicts found.');
  } else {
    lines.push('| Severity | Skill A | Skill B | Category | Description |');
    lines.push('|----------|---------|---------|----------|-------------|');
    for (const c of conflicts) {
      const icon = SEVERITY_ICON[c.severity] ?? '⚪';
      const label = SEVERITY_LABEL[c.severity] ?? c.severity;
      const desc = c.conflictDescription.replace(/\|/g, '\\|');
      lines.push(`| ${icon} ${label} | \`${c.skillA}\` | \`${c.skillB}\` | ${c.categoryTag} | ${desc} |`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push(
    `Found ${overlaps.length} overlap groups and ${conflicts.length} conflict${conflicts.length !== 1 ? 's' : ''} across ${skills.length} skills.`
  );
  return lines.join('\n');
}

export async function report({ overlaps, conflicts }, skills, outputPath = null) {
  const markdown = toMarkdown({ overlaps, conflicts }, skills);

  if (outputPath) {
    await writeFile(outputPath, markdown, 'utf8');
  }

  const lines = [];

  // Overlaps
  if (overlaps.length === 0) {
    lines.push(chalk.green('No overlapping skills found.'));
  } else {
    lines.push(chalk.bold('Overlapping Skills:'));
    for (const group of overlaps) {
      lines.push(chalk.bold(`  ${group.group}`));
      lines.push(chalk.cyan(`  Skills: ${group.skills.join(', ')}`));
      lines.push(chalk.dim(`  Reason: ${group.reason}`));
      lines.push('');
    }
  }

  // Conflicts
  if (conflicts.length === 0) {
    lines.push(chalk.green('No conflicts found.'));
  } else {
    lines.push(chalk.bold('Conflicts:'));
    for (const c of conflicts) {
      const icon = SEVERITY_ICON[c.severity] ?? '⚪';
      const color = SEVERITY_COLOR[c.severity] ?? chalk.white;
      lines.push(color(`  ${icon} ${c.skillA} vs ${c.skillB} [${c.categoryTag}]`));
      lines.push(chalk.dim(`  ${c.conflictDescription}`));
      lines.push('');
    }
  }

  lines.push(
    chalk.yellow(
      `Found ${overlaps.length} overlap groups and ${conflicts.length} conflict${conflicts.length !== 1 ? 's' : ''} across ${skills.length} skills.`
    )
  );
  return lines.join('\n');
}
