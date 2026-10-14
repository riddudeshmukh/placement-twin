import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {practiceBank} from '../src/data/practiceBank.js';
import {pythonSolutions} from '../src/data/pythonPractice.js';
import {evaluateExercise} from '../src/lib/exerciseRunner.js';
import {evaluatePythonExercise} from '../src/lib/pythonEvaluation.js';
import {choosePracticeQuestion} from '../src/lib/practiceSelection.js';
const require=createRequire(import.meta.url);
const python=require('skulpt');
for(const lesson of practiceBank){
 test('JavaScript practice '+lesson.id,async()=>{const rows=await evaluateExercise(lesson.solution,lesson);for(const row of rows)assert.equal(row.passed,true,JSON.stringify(row));});
 test('Python practice '+lesson.id,async()=>{assert.ok(pythonSolutions[lesson.id]);const rows=await evaluatePythonExercise(pythonSolutions[lesson.id],lesson,python);for(const row of rows)assert.equal(row.passed,true,JSON.stringify(row));});
}
test('Ten practice topics per level',()=>{for(const level of ['beginner','intermediate','advanced'])assert.equal(practiceBank.filter(q=>q.level===level).length,10);});
test('No random repeat until pool is covered, and no immediate cycle repeat',()=>{const pool=practiceBank.filter(q=>q.level==='beginner');let seen=[],last=null;for(let i=0;i<pool.length;i++){const result=choosePracticeQuestion(pool,seen,last);assert.equal(result.recycled,false);assert.ok(!seen.includes(result.question.id));seen.push(result.question.id);last=result.question.id;}const review=choosePracticeQuestion(pool,seen,last);assert.equal(review.recycled,true);assert.notEqual(review.question.id,last);});
