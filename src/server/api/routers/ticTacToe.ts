import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const ticTacToeRouter = createTRPCRouter({
  startNewGame: publicProcedure
    .input(z.object({ player1Id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.game.create({data: { player1: input.player1Id }});
    }),
  joinGame: publicProcedure
    .input(z.object({gameId: z.number().int(), player2Id: z.string()}))
    .mutation(({ctx, input}) => {
      return ctx.prisma.game.update({where: {gameId: input.gameId}, data: {player2: input.player2Id}}); 
  })
});

