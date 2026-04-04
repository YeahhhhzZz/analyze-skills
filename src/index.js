import { analyze } from './analyzer.js';
import { report } from './reporter.js';
import { scan } from './scanners/claude-code.js';

export async function run({ outputPath } = {}) {
  const skills = scan();
  console.log(`Found ${skills.length} skills.`);

  const groups = await analyze(skills);
  const output = await report(groups, skills, outputPath);
  console.log(output);
}
