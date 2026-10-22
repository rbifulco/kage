import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {scheduleCaptureJob} from '../src/capture-scheduler.js';

test('capture scheduler yields to a task and preserves sequential jobs', async () => {
 const events=[];
 const environment={scheduler:{postTask: async callback => {await Promise.resolve();callback();}}};
 const scheduled=scheduleCaptureJob(()=>events.push('job'),environment);
 events.push('caller');
 assert.deepEqual(events,['caller']);
 await scheduled;
 assert.deepEqual(events,['caller','job']);
});

test('fallback closes both message ports before invoking the job', async () => {
 const events=[];
 class Channel {
  constructor(){
   this.port1={close:()=>events.push('close1')};
   this.port2={close:()=>events.push('close2'),postMessage:()=>queueMicrotask(()=>this.port1.onmessage())};
  }
 }
 scheduleCaptureJob(()=>events.push('job'),{MessageChannel:Channel});
 assert.deepEqual(events,[]);
 await Promise.resolve();
 assert.deepEqual(events,['close1','close2','job']);
});

test('generated capture has no timer delays between construction jobs', () => {
 const capture=fs.readFileSync('spatial-review.html','utf8');
 const boot=capture.slice(capture.indexOf('function boot()'),capture.indexOf('function fallback('));
 assert(!boot.includes('setTimeout'));
 assert(boot.includes('scheduleCaptureJob(i < JOBS.length ? step : start)'));
 assert(boot.includes('return fallback(err)'));
 assert(fs.readFileSync('index.html','utf8').includes('setTimeout(step, 16)'));
});
