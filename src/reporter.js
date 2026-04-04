import { writeFile } from 'fs/promises';
import chalk from 'chalk';

export function toMarkdown(groups, skills) {
  const lines = [];

  if (groups.length === 0) {
    lines.push('No overlapping skills found.');
  } else {
    groups.forEach((group, index) => {
      lines.push(`## Overlap Group ${index + 1}: ${group.group}`);
      group.skills.forEach(skill => {
        lines.push(`- ${skill}`);
      });
      lines.push(`Reason: ${group.reason}`);
      if (index < groups.length - 1) {
        lines.push('');
      }
    });
  }

  if (lines.length > 0) {
    lines.push('');
    lines.push('---');
  }

  lines.push(`Found ${groups.length} overlap groups across ${skills.length} skills.`);
  return lines.join('\n');
}

export async function report(groups, skills, outputPath = null) {
  const markdown = toMarkdown(groups, skills);

  if (outputPath) {
    await writeFile(outputPath, markdown, 'utf8');
  }

  const lines = [];
  if (groups.length === 0) {
    lines.push(chalk.green('No overlapping skills found.'));
  } else {
    groups.forEach((group, index) => {
      lines.push(chalk.bold(`Overlap Group ${index + 1}: ${group.group}`));
      group.skills.forEach(skill => {
        lines.push(chalk.cyan(`- ${skill}`));
      });
      lines.push(chalk.dim(`Reason: ${group.reason}`));
      if (index < groups.length - 1) {
        lines.push('');
      }
    });
  }

  lines.push(chalk.yellow(`Found ${groups.length} overlap groups across ${skills.length} skills.`));
  return lines.join('\n');
}
