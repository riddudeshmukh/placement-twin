import {writeFile} from 'node:fs/promises';
import {format} from 'prettier';
import {practiceBank} from '../src/data/practiceBank.js';
const solutions={};
for(const question of practiceBank)solutions[question.id]=(await format(question.solution,{parser:'babel',printWidth:80})).trim();
await writeFile(new URL('../src/data/javascriptSolutions.js',import.meta.url),'// Readable reference solutions. Regenerate with npm run format:solutions.\nexport const javascriptSolutions = '+JSON.stringify(solutions,null,2)+';\n');
