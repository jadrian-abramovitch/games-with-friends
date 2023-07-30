import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const ticTacToeRouter = createTRPCRouter({
    startNewGame: publicProcedure.mutation(({ ctx }) => {
        return ctx.prisma.game.create({ data: {} });
    }),
    joinGame: publicProcedure
        .input(z.object({ gameId: z.number().int(), playerId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const game = await ctx.prisma.game.findUniqueOrThrow({
                where: { gameId: input.gameId },
            });
            if (
                input.playerId === game.player1 ||
                input.playerId === game.player2
            ) {
                return;
            }
            if (!game.player1) {
                return ctx.prisma.game.update({
                    where: { gameId: input.gameId },
                    data: { player1: input.playerId },
                });
            } else if (game.player1) {
                return ctx.prisma.game.update({
                    where: { gameId: input.gameId },
                    data: { player2: input.playerId },
                });
            }
        }),
    getBoard: publicProcedure
        .input(z.object({ gameId: z.number().int() }))
        .query(({ ctx, input }) => {
            console.log('sdfkljasdf');
            return ctx.prisma.game.findUniqueOrThrow({
                where: { gameId: input.gameId },
                select: { board: true },
            });
        }),

    playSquare: publicProcedure
        .input(
            z.object({
                playerCookie: z.string(),
                gameId: z.number().int(),
                xLocation: z.number().int(),
                yLocation: z.number().int(),
            })
        )
        .mutation(
            async ({
                ctx,
                input: { playerCookie, xLocation, yLocation, gameId },
            }) => {
                //needs to be in a transaction
                const game = await ctx.prisma.game.findUniqueOrThrow({
                    where: { gameId: gameId },
                });
                const index = xLocation * 3 + yLocation;

                //check player actually exists
                let playerNumber: number;
                if (game.player1 === playerCookie) {
                    playerNumber = 1;
                } else if (game.player2 === playerCookie) {
                    playerNumber = 2;
                } else {
                    throw Error('Player does not exist in this game');
                }

                //check turn
                if (playerNumber !== game.currentTurn) {
                    throw Error("Other player's turn");
                }

                // check if square is empty
                if (!game.board[index]) {
                    throw Error('Square is not empty');
                }

                const playerSymbol = playerNumber === 1 ? 'X' : 'O';
                const newBoard =
                    game.board.slice(0, index) +
                    playerSymbol +
                    game.board.slice(index + 1);
                return ctx.prisma.game.update({
                    where: { gameId: game.gameId },
                    data: {
                        board: newBoard,
                        currentTurn: 3 - game.currentTurn,
                    },
                });
            }
        ),
});
