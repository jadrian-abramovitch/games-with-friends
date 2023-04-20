import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { serialize } from "cookie";

export const ticTacToeRouter = createTRPCRouter({
  startNewGame: publicProcedure
    .input(z.object({ gameId: z.number().int() }))
    .query(({ ctx, input}) => {
    const gameId = 5;
      return ctx.prisma.Game.create({ data: { gameId } });
    })
});

