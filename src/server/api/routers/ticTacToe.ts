import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const ticTacToeRouter = createTRPCRouter({
  startNewGame: publicProcedure
    .mutation(({ ctx }) => {
      return ctx.prisma.game.create({data: {}});
    }),
  joinGame: publicProcedure
    .input(z.object({gameId: z.number().int(), playerId: z.string()}))
    .mutation( async ({ctx, input}) => {
    const game = await ctx.prisma.game.findUniqueOrThrow({where: {gameId: input.gameId}});
    if (!game.player1) {
      return ctx.prisma.game.update({where: {gameId: input.gameId}, data: {player1: input.playerId}});
    } else if (game.player1) {
      return ctx.prisma.game.update({where: {gameId: input.gameId}, data: {player2: input.playerId}});
    }
  }),
  playSquare: publicProcedure
  .input(z.object({playerCookie: z.string(), gameId: z.number().int(), xLocation: z.number().int(), yLocation: z.number().int()}))
  .mutation( async ({ ctx, input: {xLocation, yLocation, gameId}}) => {
    //needs to be in a transaction
    // Game board will be represented as string where e -> empty, x is one player, y is other player
    const game = await ctx.prisma.game.findUniqueOrThrow({where: {gameId: gameId}});
    const newBoard = game.board;
    if (!newBoard[xLocation*3 + yLocation]) { throw Error('Square is not empty'); }
    newBoard[xLocation*3 + yLocation] = 'x'; //TODO handle both players
    return ctx.prisma.game.update({where: {gameId: game.gameId}, data: {board: newBoard}});
  })
});

