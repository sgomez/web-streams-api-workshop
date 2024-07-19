import { type Message } from './Message';

export interface MessageProcessor {
  processRaw: (message: Uint8Array) => Promise<void>;
  processString: (message: string) => Promise<void>;
  process: (message: Message) => Promise<void>;
}
