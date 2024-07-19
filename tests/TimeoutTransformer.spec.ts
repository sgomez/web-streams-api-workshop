import { ReadableStream } from 'node:stream/web';

import { describe, expect, it } from 'vitest';
import { TimeoutTransformer } from '../src/TimeoutTransformer';
import { delay } from 'msw';

describe.skip('filter messages checking heartbeat', () => {
  it('should iterate until the end of the stream', async () => {
    // Arrange
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue('chunk-1');
        controller.close();
      },
    });

    // Act
    const reader = stream
      .pipeThrough(new TimeoutTransformer<string>(100))
      .getReader();

    // Assert
    await expect(reader.read()).resolves.toEqual({
      value: 'chunk-1',
      done: false,
    });
    await expect(reader.read()).resolves.toEqual({
      done: true,
    });
  });

  it('should iterate until timeout', async () => {
    // Arrange
    const stream = new ReadableStream({
      async start(controller) {
        await delay(50);
        controller.enqueue('chunk-1');

        await delay(15000);
        controller.enqueue('chunk-2');

        controller.close();
      },
    });

    // Act
    const reader = stream
      .pipeThrough(new TimeoutTransformer<string>(100))
      .getReader();

    // Assert
    await expect(reader.read()).resolves.toEqual({
      value: 'chunk-1',
      done: false,
    });
    await expect(reader.read()).rejects.toThrowError('Timeout Error');
  });
});
