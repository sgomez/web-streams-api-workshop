import { TransformStream } from 'node:stream/web';

export class LineBufferTransformer extends TransformStream<string, string> {
  constructor() {
    let buffer = '';

    const processBuffer = (
      buffer: string,
      controller: TransformStreamDefaultController<string>,
    ): string => {
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.length > 0) {
          controller.enqueue(line);
        }
      }

      return buffer;
    };

    super({
      start() {
        buffer = '';
      },
      transform(chunk, controller) {
        buffer += chunk;
        buffer = processBuffer(buffer, controller);
      },
      flush(controller) {
        buffer = processBuffer(buffer, controller);
        if (buffer.length > 1) {
          controller.enqueue(buffer);
        }
      },
    });
  }
}
