import { type ReadableStream } from 'node:stream/web';
import { type MessageProcessor } from './MessageProcessor';

export class RawStreamClient {
  constructor(private readonly messageProcessor: MessageProcessor) {}

  async process(): Promise<void> {
    const response = await fetch('http://api.example.com/stream', {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Connection error');
    }

    const readableStream = response.body as ReadableStream<Uint8Array> | null;
    if (!readableStream) {
      throw new Error('Stream error');
    }

    const stream = readableStream;

    for await (const message of stream) {
      await this.messageProcessor.processRaw(message);
    }
  }
}
