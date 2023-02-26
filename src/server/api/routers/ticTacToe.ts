import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const gameState = [[0,0,0], [1,0,2], [1,2,0]];

export const ticTacToeRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ gameId: z.number().int() }))
    .query(({ input }) => {
      return {
        greeting: gameState,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),
});
