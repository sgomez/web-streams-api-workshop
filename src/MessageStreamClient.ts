import { type ReadableStream } from 'node:stream/web';
import { MessageProcessor } from './MessageProcessor';
import { TextDecoderStream } from 'stream/web';

export class MessageStreamClient {
  constructor(private readonly messageProcessor: MessageProcessor) {}

  async process(): Promise<void> {
    const abortController = new AbortController();

    const response = await fetch('http://api.example.com/stream', {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error('Connection error');
    }

    const readableStream = response.body as ReadableStream<Uint8Array> | null;
    if (!readableStream) {
      throw new Error('Stream error');
    }

    const stream = readableStream.pipeThrough(new TextDecoderStream());

    try {
      for await (const message of stream) {
        await this.messageProcessor.process(message);
      }
    } catch (error: unknown) {
      abortController.abort((error as Error).message);

      throw error;
    }
  }
}
