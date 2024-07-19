import { TestContext } from './setup/msw';
import { MessageStreamClient } from '../src/MessageStreamClient';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';
import { delay, http, HttpResponse } from 'msw';
import { MessageProcessor } from '../src/MessageProcessor';
import { Message } from '../src/Message';

interface LocalContext extends TestContext {
  messageProcessor: Mocked<MessageProcessor>;
}

describe('process formatted messages from stream', () => {
  beforeEach<LocalContext>((context) => {
    context.messageProcessor = {
      processRaw: vi.fn(),
      processString: vi.fn(),
      process: vi.fn(),
    };
  });

  it<LocalContext>('should read a message from a stream', async ({
    messageProcessor,
    server,
  }) => {
    // Arrange
    server.use(
      http.get('http://api.example.com/stream', () => {
        const message: Message = {
          id: 1,
          message: 'Hi!',
        };

        const encoder = new TextEncoder();

        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(encoder.encode(JSON.stringify(message)));
            controller.close();
          },
        });

        return new HttpResponse(stream);
      }),
    );

    const streamProcessor = new MessageStreamClient(messageProcessor);

    // Act
    await streamProcessor.process();

    // Assert
    expect(messageProcessor.process).toHaveBeenCalledWith({
      id: 1,
      message: 'Hi!',
    });
  });

  it<LocalContext>('should process several messages', async ({
    server,
    messageProcessor,
  }) => {
    // Arrange
    server.use(
      http.get('http://api.example.com/stream', () => {
        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(encoder.encode('{"id":1,"mess'));
            controller.enqueue(encoder.encode('age":"Hi!"}\n'));
            controller.enqueue(
              encoder.encode(
                '{"id":2,"message":"Bye!"}\n{"id":3,"message":"Bye!"}\n',
              ),
            );
            controller.close();
          },
        });

        return new HttpResponse(stream);
      }),
    );

    const streamProcessor = new MessageStreamClient(messageProcessor);

    // Act
    await streamProcessor.process();

    // Assert
    expect(messageProcessor.process).toHaveBeenCalledWith({
      id: 1,
      message: 'Hi!',
    });
    expect(messageProcessor.process).toHaveBeenCalledWith({
      id: 2,
      message: 'Bye!',
    });
    expect(messageProcessor.process).toHaveBeenCalledWith({
      id: 3,
      message: 'Bye!',
    });
  });

  it<LocalContext>('should handle timeouts', async ({
    messageProcessor,
    server,
  }) => {
    // Arrange
    server.use(
      http.get('http://api.example.com/stream', () => {
        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            await delay(50);
            controller.enqueue(encoder.encode('\n'));
            await delay(500);
            controller.enqueue(encoder.encode('\n'));
            controller.close();
          },
        });

        return new HttpResponse(stream);
      }),
    );

    const streamProcessor = new MessageStreamClient(messageProcessor);

    // Act
    const result = streamProcessor.process();

    // Assert
    await expect(result).rejects.toThrowError('Timeout Error');
  });
});
