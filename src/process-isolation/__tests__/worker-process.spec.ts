describe('worker-process', () => {
  let messageHandler: (task: unknown) => void;
  let sendMock: jest.Mock;
  let originalOn: typeof process.on;
  let originalSend: typeof process.send;
  let originalPid: number;

  beforeEach(() => {
    jest.resetModules();
    sendMock = jest.fn();
    originalOn = process.on;
    originalSend = process.send;
    originalPid = process.pid;

    process.on = ((event: string, handler: (...args: any[]) => void) => {
      if (event === 'message') {
        messageHandler = handler;
      }
      return process;
    }) as typeof process.on;

    Object.defineProperty(process, 'send', {
      value: sendMock,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    process.on = originalOn;
    Object.defineProperty(process, 'send', {
      value: originalSend,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(process, 'pid', {
      value: originalPid,
      configurable: true,
    });
  });

  it('should process a task and send the result', () => {
    Object.defineProperty(process, 'pid', { value: 12345, configurable: true });
    require('../worker-process');

    messageHandler({ id: 'task-1' });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 'task-1',
        processedBy: 12345,
        result: expect.any(Number),
      })
    );
  });

  it('should not send when process.send is unavailable', () => {
    Object.defineProperty(process, 'send', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    require('../worker-process');
    messageHandler({ id: 'task-2' });

    expect(sendMock).not.toHaveBeenCalled();
  });
});
