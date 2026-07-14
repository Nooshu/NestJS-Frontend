import { EventEmitter } from 'events';

const mockFork = jest.fn();
const mockCpus = jest.fn();

jest.mock('child_process', () => ({
  fork: (...args: unknown[]) => mockFork(...args),
}));

jest.mock('os', () => ({
  cpus: (...args: unknown[]) => mockCpus(...args),
}));

describe('ProcessManager', () => {
  let ProcessManager: typeof import('../worker').default;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockCpus.mockReturnValue([{}, {}, {}]);
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    ProcessManager = require('../worker').default;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  const createMockWorker = () => {
    const worker = new EventEmitter() as EventEmitter & {
      send: jest.Mock;
      kill: jest.Mock;
    };
    worker.send = jest.fn();
    worker.kill = jest.fn();
    mockFork.mockReturnValueOnce(worker);
    return worker;
  };

  it('should start one worker per CPU and wire event handlers', () => {
    const workers = [createMockWorker(), createMockWorker(), createMockWorker()];
    const manager = new ProcessManager();

    manager.startWorkers();

    expect(consoleLogSpy).toHaveBeenCalledWith('Starting 3 worker processes...');
    expect(mockFork).toHaveBeenCalledTimes(3);
    expect(mockFork).toHaveBeenCalledWith('./src/process-isolation/worker-process.ts');

    workers[0].emit('message', { ok: true });
    workers[1].emit('error', new Error('worker failed'));
    workers[2].emit('exit', 1);

    expect(consoleLogSpy).toHaveBeenCalledWith('Received from worker 0:', { ok: true });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Worker 1 error:', expect.any(Error));
    expect(consoleLogSpy).toHaveBeenCalledWith('Worker 2 exited with code 1');
  });

  it('should distribute tasks to a worker', () => {
    const workers = [createMockWorker(), createMockWorker(), createMockWorker()];
    const manager = new ProcessManager();
    manager.startWorkers();

    jest.spyOn(Math, 'random').mockReturnValue(0.4);
    manager.distributeTask({ id: 42 });

    expect(workers[1].send).toHaveBeenCalledWith({ id: 42 });
  });

  it('should shut down all workers', () => {
    const workers = [createMockWorker(), createMockWorker(), createMockWorker()];
    const manager = new ProcessManager();
    manager.startWorkers();
    manager.shutdown();

    workers.forEach((worker) => {
      expect(worker.kill).toHaveBeenCalled();
    });
  });
});
