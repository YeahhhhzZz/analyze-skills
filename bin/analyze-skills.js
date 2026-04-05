#!/usr/bin/env node
import { Command } from 'commander';
import { run } from '../src/index.js';

const program = new Command();

program
  .name('analyze-skills')
  .description('Analyze installed Claude Code skills for overlaps')
  .version('0.1.0')
  .option('-o, --output <file>', 'write the report to a Markdown file');

const argv = process.argv.slice(2);
const skipsApiKeyCheck = argv.includes('--help') || argv.includes('-h') || argv.includes('--version') || argv.includes('-V');

if (!skipsApiKeyCheck && !process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY environment variable is required.');
  process.exit(1);
}

await program.parseAsync(process.argv);

const options = program.opts();
if (!program.args.length && !argv.some(arg => arg === '--help' || arg === '-h' || arg === '--version' || arg === '-V')) {
  await run({ outputPath: options.output });
}
