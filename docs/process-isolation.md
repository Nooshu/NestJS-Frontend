# Process Isolation and Worker Management

This document explains how to use the process isolation system to handle CPU-intensive tasks and prevent main thread congestion in Node.js applications.

## Overview

The process isolation system provides a way to distribute CPU-intensive tasks across multiple processes, effectively utilizing all available CPU cores and preventing main thread congestion. This is particularly useful for:

- CPU-intensive computations
- Image processing
- Data analysis
- Any task that could block the main thread

## Architecture

The system consists of two main components:

1. `ProcessManager` - Manages worker processes and task distribution
2. `Worker Process` - Handles the actual CPU-intensive work

## Usage

### Basic Usage

```typescript
import ProcessManager from './src/process-isolation/worker';

// Create a new process manager
const processManager = new ProcessManager();

// Start worker processes (one per CPU core)
processManager.startWorkers();

// Distribute tasks to workers
processManager.distributeTask({
  id: 1,
  data: 'some data to process'
});

// Handle results (in your application code)
processManager.on('result', (result) => {
  console.log('Task completed:', result);
});

// Shutdown workers when done
processManager.shutdown();
```

### Advanced Usage

#### Custom Task Processing

You can customize the task processing logic in the worker process:

```typescript
// In worker-process.ts
function processTask(task: any) {
  // Your custom processing logic here
  return {
    taskId: task.id,
    result: yourProcessingFunction(task.data),
    processedBy: process.pid
  };
}
```

#### Error Handling

The system includes built-in error handling:

```typescript
processManager.on('error', (error) => {
  console.error('Worker error:', error);
  // Handle worker errors appropriately
});
```

#### Graceful Shutdown

Always ensure proper shutdown of workers:

```typescript
// Handle application shutdown
process.on('SIGTERM', () => {
  processManager.shutdown();
  process.exit(0);
});
```

## Best Practices

1. **Task Distribution**
   - Keep tasks reasonably sized
   - Avoid sending large objects between processes
   - Use serializable data structures

2. **Resource Management**
   - Monitor worker memory usage
   - Implement proper error handling
   - Clean up resources when workers are done

3. **Performance Considerations**
   - Use worker processes for CPU-intensive tasks only
   - Keep I/O operations in the main thread
   - Consider using worker threads for less intensive tasks

## Example Scenarios

### Image Processing

```typescript
// Distribute image processing tasks
const imageTasks = images.map((image, index) => ({
  id: index,
  type: 'image-processing',
  data: image
}));

imageTasks.forEach(task => processManager.distributeTask(task));
```

### Data Analysis

```typescript
// Distribute data analysis tasks
const analysisTasks = datasets.map((dataset, index) => ({
  id: index,
  type: 'data-analysis',
  data: dataset
}));

analysisTasks.forEach(task => processManager.distributeTask(task));
```

## Troubleshooting

### Common Issues

1. **Worker Process Crashes**
   - Check for memory leaks
   - Verify error handling
   - Monitor system resources

2. **Performance Issues**
   - Ensure tasks are properly sized
   - Check CPU utilization
   - Monitor memory usage

3. **Communication Problems**
   - Verify data serialization
   - Check message format
   - Ensure proper error handling

## API Reference

### ProcessManager

- `constructor()` - Creates a new process manager
- `startWorkers()` - Starts worker processes
- `distributeTask(task: any)` - Distributes a task to workers
- `shutdown()` - Gracefully shuts down all workers

### Events

- `message` - Emitted when a worker sends a message
- `error` - Emitted when a worker encounters an error
- `exit` - Emitted when a worker process exits 