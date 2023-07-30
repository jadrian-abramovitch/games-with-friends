import { type NextPage } from 'next';
import { useState } from 'react';
import { useEffect } from 'react';
import { api } from '~/utils/api';
import { useRouter } from 'next/router';
import useCheckForWin from './useCheckForWin';

const playerCookieExists = () => {
    if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i]?.includes('ticTacToe')) {
                return cookies[i];
            }
        }
    }
    return false;
};
const setCookie = (name: string, value: string, days?: number): void => {
    if (typeof window !== 'undefined') {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie =
            'ticTacToe' + name + '=' + value + expires + '; path=/';
    }
};

const getCookie = (name: string): string | null => {
    if (typeof window !== 'undefined') {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
    }
    return null;
};
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

const randomNumberString = Math.random().toString();

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
    const [playerCookie, setPlayerCookie] = useState<string>();

    const registerToGame = api.ticTacToe.joinGame.useMutation();
    const sendMove = api.ticTacToe.playSquare.useMutation({
        onSuccess: () => gameStateQuery.refetch(),
    });
    const gameStateQuery = api.ticTacToe.getBoard.useQuery(
        { gameId: gameId },
        {
            onSuccess: (data) => setBoard(transformBoardToArray(data?.board)),
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

    const currentPlayerCookie = playerCookieExists();
    if (currentPlayerCookie && currentPlayerCookie !== playerCookie) {
        setPlayerCookie(currentPlayerCookie);
    } else if (!currentPlayerCookie) {
        setCookie(randomNumberString, '', 2);
        // setPlayerCookie(randomNumberString);
    }
    if (playerCookie && gameId && registerToGame.isIdle) {
        registerToGame.mutate({
            gameId: Number(gameId),
            playerId: playerCookie,
        });
    }

    const boardStructure = (board: number[][]) => {
        return board.map((row, i: number) => {
            return row.map((cell, j: number) => {
                return (
                    <button
                        disabled={!isNaN(cell)}
                        onClick={async () => await handleClick(i, j)}
                        key={i.toString() + '-' + j.toString()}
                        className="m-4 h-32 w-32 bg-sky-500"
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

    const handleClick = async (i: number, j: number) => {
        if (typeof playerCookie === 'string' && typeof gameId === 'number') {
            sendMove.mutate({
                gameId,
                playerCookie,
                xLocation: i,
                yLocation: j,
            });
        }
        setTurn(3 - turn); // flips between 2 and 1
    };

    return (
        <div className="flex h-screen items-center justify-center">
            <div>
                <h1 className="text-center text-7xl">TicTacToe!</h1>
                {isNaN(winner) &&
                    boardStructure(board).map((row, index: number) => (
                        <div key={index.toString()}>{row}</div>
                    ))}
                {!isNaN(winner) && winner !== 0 && (
                    <h2 className="text-center text-4xl">
                        Game Over, player {map[3 - winner]} wins!
                    </h2>
                )}
                {!isNaN(winner) && winner === 0 && (
                    <h2 className="text-center text-4xl">Game Over, Draw!</h2>
                )}
            </div>
        </div>
    );
};
export default TicTacToe;
