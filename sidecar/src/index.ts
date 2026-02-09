import { router } from './trpc.js';

const appRouter = router({
  // ...
});

export type AppRouter = typeof appRouter;
