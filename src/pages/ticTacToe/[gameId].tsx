import { type NextPage } from 'next';
import { useState } from 'react';
import { api } from '~/utils/api';
import { useRouter } from 'next/router';
import useCheckForWin from './useCheckForWin';
import UsePlayerCookie from './usePlayerCookie';

type CellState = 1 | 2 | typeof NaN;
const map: { [key: CellState]: string } = {
    NaN: '?',
    1: 'O',
    2: 'X',
};

const mapDbToBoard: { [key: string]: CellState } = {
    '?': NaN,
    O: 1,
    X: 2,
};


const TicTacToe: NextPage = () => {
    const router = useRouter();
    const gameId = Number(router.query.gameId);

    const [turn, setTurn] = useState<number>(1); // 1 ->'O's, 2 -> x's
    const [board, setBoard] = useState<number[][]>([
        [NaN, NaN, NaN],
        [NaN, NaN, NaN],
        [NaN, NaN, NaN],
    ]);
    const winner = useCheckForWin(board, turn);
    const [playerId, setPlayerId] = useState<number>(0);

    const cookie = UsePlayerCookie();
    const [playerCookie, ] = useState<string>(cookie);

    const registerToGame = api.ticTacToe.joinGame.useMutation({
        onSuccess: (data) => {
            if (playerCookie === data?.player1) {
                setPlayerId(1);
            } else if (playerCookie === data?.player2) {
                setPlayerId(2);
            }
        },
    });
    const sendMove = api.ticTacToe.playSquare.useMutation({
        onSuccess: async () => {
            await gameStateQuery.refetch();
        },
        onError: (error) => {
            if (error.message === "Other player's turn") {
                window.alert('Patience young grasshopper');
            }
        },
    });
    const gameStateQuery = api.ticTacToe.getBoard.useQuery(
        { gameId: gameId },
        {
            onSuccess: (data) => {
                setBoard(transformBoardToArray(data?.board));
                setTurn(data.currentTurn);
            },
        }
    );

    function transformBoardToArray(stringBoard: string) {
        const newBoard: number[][] = [0, 1, 2].map(() =>
            [0, 1, 2].map(() => NaN)
        );
        let stringIndex = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const temp: string = stringBoard[stringIndex] || '?';
                newBoard[i]![j] = mapDbToBoard[temp] || NaN;
                stringIndex++;
            }
        }
        return newBoard;
    }


    if (playerCookie && gameId && registerToGame.isIdle) {
        registerToGame.mutate({
            gameId: Number(gameId),
            playerId: playerCookie,
        });
    }

    const boardStructure = (
        board: number[][],
        turn: number,
        playerId: number
    ) => {
        return board.map((row, i: number) => {
            return row.map((cell, j: number) => {
                return (
                    <button
                        disabled={turn !== playerId}
                        onClick={() => handleClick(i, j)}
                        key={i.toString() + '-' + j.toString()}
                        className={
                            turn === playerId
                                ? 'm-4 h-32 w-32 bg-sky-500'
                                : 'm-4 h-32 w-32 bg-gray-600'
                        }
                    >
                        <h2 className="">
                            {isNaN(cell) ? '?' : map[boardAt(i, j)]}
                        </h2>
                    </button>
                );
            });
        });
    };
    const boardAt = (i: number, j: number): CellState => {
        const row = board[i];
        if (row === undefined) throw new Error();
        return row[j] as CellState;
    };

    const handleClick = (i: number, j: number) => {
        if (typeof playerCookie === 'string' && typeof gameId === 'number') {
            sendMove.mutate({
                gameId,
                playerCookie,
                xLocation: i,
                yLocation: j,
            });
        }
    };

    return (
        <>
            <div className="flex h-screen items-center justify-center">
                <div>
                    <h1 className="text-center text-7xl">TicTacToe!</h1>
                    {isNaN(winner) &&
                        boardStructure(board, turn, playerId).map(
                            (row, index: number) => (
                                <div key={index.toString()}>{row}</div>
                            )
                        )}
                    {!isNaN(winner) && winner !== 0 && (
                        <h2 className="text-center text-4xl">
                            {winner === playerId
                                ? 'You won!'
                                : 'You lost :( better luck next time'}
                        </h2>
                    )}
                    {!isNaN(winner) && winner === 0 && (
                        <h2 className="text-center text-4xl">
                            Game Over, Draw!
                        </h2>
                    )}
                    {isNaN(winner) && turn === playerId && (
                        <h2>Your turn!</h2>
                    )}
                    {isNaN(winner) && turn !== playerId && (
                        <h2>Waiting for other player to move</h2>
                    )}
                </div>
            </div>
        </>
    );
};
export default TicTacToe;
