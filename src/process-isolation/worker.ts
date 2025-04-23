import { fork, ChildProcess } from 'child_process';
import { cpus } from 'os';

class ProcessManager {
  private workers: ChildProcess[] = [];
  private numCPUs: number;

  constructor() {
    this.numCPUs = cpus().length;
  }

  public startWorkers() {
    console.log(`Starting ${this.numCPUs} worker processes...`);

    for (let i = 0; i < this.numCPUs; i++) {
      const worker = fork('./src/process-isolation/worker-process.ts');
      
      worker.on('message', (message) => {
        console.log(`Received from worker ${i}:`, message);
      });

      worker.on('error', (error) => {
        console.error(`Worker ${i} error:`, error);
      });

      worker.on('exit', (code) => {
        console.log(`Worker ${i} exited with code ${code}`);
      });

      this.workers.push(worker);
    }
  }

  public distributeTask(task: any) {
    // Simple round-robin distribution
    const workerIndex = Math.floor(Math.random() * this.workers.length);
    this.workers[workerIndex].send(task);
  }

  public shutdown() {
    this.workers.forEach(worker => worker.kill());
  }
}

export default ProcessManager; 