/** Yield between capture jobs without hidden-iframe timer clamping. */
export function scheduleCaptureJob(callback, environment = globalThis) {
 if (environment.scheduler?.postTask) {
  return environment.scheduler.postTask(callback, {priority: 'user-visible'});
 }
 const channel = new environment.MessageChannel();
 channel.port1.onmessage = () => {
  channel.port1.close();
  channel.port2.close();
  callback();
 };
 channel.port2.postMessage(null);
}
