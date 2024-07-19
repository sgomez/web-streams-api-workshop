import { TransformStream } from 'node:stream/web';

export class TimeoutTransformer<T = unknown> extends TransformStream<T, T> {
  constructor(timeoutInMs: number = 30_000) {
    let controllerRef: TransformStreamDefaultController;
    let timeoutId: NodeJS.Timeout | undefined;

    function resetTimeout() {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        controllerRef.error(new Error('Timeout Error'));
      }, timeoutInMs);
    }

    super({
      start(controller) {
        controllerRef = controller;
        resetTimeout();
      },
      transform(chunk, controller) {
        resetTimeout();
        controller.enqueue(chunk);
      },
      flush() {
        clearTimeout(timeoutId);
      },
    });
  }
}
