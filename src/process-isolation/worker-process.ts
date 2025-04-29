process.on('message', (task: any) => {
  // Simulate some CPU-intensive work
  const result = processTask(task);
  if (process.send) {
    process.send(result);
  }
});

function processTask(task: any) {
  // This is where you would put your actual CPU-intensive work
  // For demonstration, we'll just do some heavy computation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i);
  }

  return {
    taskId: task.id,
    result: result,
    processedBy: process.pid,
  };
}
