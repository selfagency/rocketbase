import { createHTTPServer } from '@trpc/server/adapters/standalone';
import logger from './logger.js';
import { publicProcedure, router } from './trpc.js';

const appRouter = router({
  sendEmail: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'to' in val && 'subject' in val && 'body' in val) {
        return val as { to: string; subject: string; body: string };
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input }) => {
      // Here you would implement the logic to send an email using your preferred email service
      logger.info(`Sending email to ${input.to} with subject "${input.subject}" and body "${input.body}"`);
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    }),
});

const server = createHTTPServer({
  router: appRouter,
});

server.listen(3971);
