import { TestContext } from './setup/msw';
import { TextStreamClient } from '../src/TextStreamClient';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { MessageProcessor } from '../src/MessageProcessor';

interface LocalContext extends TestContext {
  messageProcessor: Mocked<MessageProcessor>;
}

describe.skip('process text messages from stream', () => {
  beforeEach<LocalContext>((context) => {
    context.messageProcessor = {
      processRaw: vi.fn(),
      processString: vi.fn(),
      process: vi.fn(),
    };
  });

  it<LocalContext>('should read text data from a stream', async ({
    messageProcessor,
    server,
  }) => {
    // Arrange
    server.use(
      http.get('http://api.example.com/stream', () => {
        const message = 'Hello, World!';
        const encoder = new TextEncoder();

        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(encoder.encode(message));
            controller.close();
          },
        });

        return new HttpResponse(stream);
      }),
    );

    const streamProcessor = new TextStreamClient(messageProcessor);

    // Act
    await streamProcessor.process();

    // Assert
    expect(messageProcessor.processString).toHaveBeenCalledWith(
      'Hello, World!',
    );
  });
});
