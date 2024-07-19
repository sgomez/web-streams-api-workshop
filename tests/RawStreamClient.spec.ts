import { TestContext } from './setup/msw';
import { RawStreamClient } from '../src/RawStreamClient';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { MessageProcessor } from '../src/MessageProcessor';

interface LocalContext extends TestContext {
  messageProcessor: Mocked<MessageProcessor>;
}

describe('process raw messages from stream', () => {
  beforeEach<LocalContext>((context) => {
    context.messageProcessor = {
      processRaw: vi.fn(),
      processString: vi.fn(),
      process: vi.fn(),
    };
  });

  it<LocalContext>('should read raw data from a stream', async ({
    messageProcessor,
    server,
  }) => {
    // Arrange
    server.use(
      http.get('http://api.example.com/stream', () => {
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new Uint8Array([13, 17]));
            controller.close();
          },
        });

        return new HttpResponse(stream);
      }),
    );

    const streamProcessor = new RawStreamClient(messageProcessor);

    // Act
    await streamProcessor.process();

    // Assert
    expect(messageProcessor.processRaw).toHaveBeenCalledWith(
      new Uint8Array([13, 17]),
    );
  });
});
