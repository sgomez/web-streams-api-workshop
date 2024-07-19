import { TransformStream } from 'node:stream/web';
import { type Message, MessageSchema } from './Message';

export class MessageDecoderStream extends TransformStream<string, Message> {
  constructor() {
    super({
      transform(chunk, controller) {
        try {
          const parsed = JSON.parse(chunk);
          const result = MessageSchema.parse(parsed);

          controller.enqueue(result);
        } catch (error: unknown) {
          controller.error(new Error('Invalid message format'));
        }
      },
    });
  }
}

const messageDecoderStream = new TransformStream<string, Message>({
  transform(chunk, controller) {
    try {
      const parsed = JSON.parse(chunk);
      const result = MessageSchema.parse(parsed);

      controller.enqueue(result);
    } catch (error: unknown) {
      controller.error(new Error('Invalid message format'));
    }
  },
});
