import { analyze } from './analyzer.js';
import { analyzeConflicts } from './conflict-analyzer.js';
import { report } from './reporter.js';
import { scan } from './scanners/claude-code.js';

export async function run({ outputPath } = {}) {
  const skills = scan();
  console.log(`Found ${skills.length} skills.`);

  const [overlaps, conflicts] = await Promise.all([
    analyze(skills),
    analyzeConflicts(skills),
  ]);

  const output = await report({ overlaps, conflicts }, skills, outputPath);
  console.log(output);
}
