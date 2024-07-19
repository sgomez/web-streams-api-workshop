import { beforeAll } from 'vitest';
import { setupServer, SetupServerApi } from 'msw/node';
import { afterAll } from 'vitest';
import { beforeEach } from 'vitest';
import { afterEach } from 'vitest';

export interface TestContext {
  server: SetupServerApi;
}

const server = setupServer();

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

afterAll(() => {
  server.close();
});

beforeEach<TestContext>((context) => {
  context.server = server;
});

afterEach<TestContext>(({ server }) => {
  server.resetHandlers();
});
