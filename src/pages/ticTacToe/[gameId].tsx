import { type NextPage } from 'next';
import { useState } from 'react';
import { useEffect } from 'react';
import { api } from '~/utils/api';
import { useRouter } from 'next/router';

const TOTAL_MOVES_PLAYER_O = 5;
const TOTAL_MOVES_PLAYER_X = 4;

type CellState = 1 | 2 | typeof NaN;
const myRandomCookie = Math.random().toString();

const TicTacToe: NextPage = () => {
    const router = useRouter();
    const gameId = Number(router.query.gameId);

    const registerToGame = api.ticTacToe.joinGame.useMutation();
 
    const map: { [key: CellState]: string } = {
        NaN: '?',
        1: 'O',
        2: 'X',
    };

    const mapDbToBoard: { [key: string]: CellState } = {
        '?': NaN,
        'O': 1,
        'X': 2,
    }   

    function transformBoard(stringBoard: string) {
        const newBoard: number[][] = [0,1,2].map(() => [0,1,2].map(() => NaN));
        let stringIndex = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const temp: string = stringBoard[stringIndex] || '?';
                newBoard[i][j] = mapDbToBoard[temp] || NaN;
                stringIndex++;
            }
        }
        return newBoard;
    }

    function setCookie(name: string, value: string, days?: number): void {
        if (typeof window !== 'undefined') {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        }
    }

    function getCookie(name: string): string | null {
        if (typeof window !== 'undefined') {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }

    const sendMove = api.ticTacToe.playSquare.useMutation();
    const playerCookie = getCookie(myRandomCookie);
    if (!playerCookie) {
        setCookie(myRandomCookie, myRandomCookie, 5);
    } else if (gameId && registerToGame.isIdle) {
        registerToGame.mutate({gameId: Number(gameId), playerId: playerCookie});
    }

    const boardIsEmpty = () => {
        console.log(board.flat().reduce((total, current) => total + current));
        return(board.flat().reduce((total, current) => total + current) < 1); 
    }

    const getBoard = (board) => {
        return(board.map((row, i: number) => {
            return(row.map((cell, j: number) => {
                return(
                    <button
                        disabled={!isNaN(cell)}
                        onClick={() => handleClick(i, j)}
                        key={i.toString() + '-' + j.toString()}
                        className="m-4 h-32 w-32 bg-sky-500"
                    >
                    <h2 className="">{isNaN(cell) ?  "?" : map[getBoardValue(i, j)]}</h2>
                    </button>
                );
            }));
        }));
            /*
        if (!boardIsEmpty()) {
            //window.alert('not empty');
            const gameBoard = [0,1,2].map((i) => {
                return([0,1,2].map((j) => ( 
                    <button
                        onClick={() => handleClick(i, j)}
                        key={i.toString() + '-' + j.toString()}
                        className="m-4 h-32 w-32 bg-sky-500"
                    >
                        <h2 className="">{map[getBoardValue(i, j)]}</h2>
                    </button>
                ))); 
            });
        return gameBoard
        } else {
            return board;
        }*/
    };
    const [turn, setTurn] = useState<number>(1); // 1 ->'O's, 2 -> x's
    const [board, setBoard] = useState<number[][]>([
        [NaN, NaN, NaN],
        [NaN, NaN, NaN],
        [NaN, NaN, NaN],
    ]);
    const [winner, setWinner] = useState(NaN);

    
    const getBoardValue = (i: number, j: number): CellState => {
        const row = board[i];
        if (row === undefined) throw new Error();
        return row[j] as CellState;
    }

    const handleClick = (i: number, j: number) => {
        if (typeof playerCookie === 'string' && typeof gameId === 'number') {
            window.alert(gameId);
            sendMove.mutate({ gameId, playerCookie, xLocation: i, yLocation: j});
        }
        const oldBoard = board;
        const rowToUpdate = oldBoard[i];
        if (rowToUpdate === undefined) throw new Error('Board is empty');
        rowToUpdate[j] = turn;
        oldBoard[i] = rowToUpdate;
        //setBoard(oldBoard);
        setTurn(3 - turn); // flips between 2 and 1
    };
    
    const gameStateQuery = api.ticTacToe.getBoard.useQuery({gameId: gameId}, {enabled: false});
    const refreshBoard = () => {
        gameStateQuery.refetch().then(({data}) => setBoard(transformBoard(data?.board))).catch(() => window.alert('could not fetch board state'));
    }

    useEffect(() => {
        let sum = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                sum += getBoardValue(i,j);
            }
        }
        for (let i = 0; i < 3; i++) {
            // horizontal win
            if ((getBoardValue(i, 0) + getBoardValue(i, 1) + getBoardValue(i, 2)) % 3 === 0) {
                return setWinner(turn);
            }
            // vertical win
            if ((getBoardValue(0, i) + getBoardValue(1, i) + getBoardValue(2, i)) % 3 === 0) {
                return setWinner(turn);
            }
        }
        //diagonal wins
        if ((getBoardValue(0, 0) + getBoardValue(1, 1) + getBoardValue(2, 2)) % 3 === 0) {
            return setWinner(turn); 
        }
        if ((getBoardValue(0, 2) + getBoardValue(1, 1) + getBoardValue(2, 0)) % 3 === 0) {
            return setWinner(turn); 
        }
        if (sum === 1 * TOTAL_MOVES_PLAYER_O + 2 * TOTAL_MOVES_PLAYER_X) {
            setWinner(0);
        }
    }, [JSON.stringify(board)]);
    return (
        <div className="flex h-screen items-center justify-center">
            <div>
                <h1 className="text-center text-7xl">TicTacToe!</h1>
                {isNaN(winner) &&
                    getBoard(board).map((row, index: number) => (
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
                {isNaN(winner) && gameStateQuery.isSuccess && (
                    <h2 className="text-center text-4xl">
                        <h2>{JSON.stringify(gameStateQuery.data)}</h2>
                        <h2>{JSON.stringify(board)}</h2>
                        <h2>{JSON.stringify(transformBoard(gameStateQuery.data.board))}</h2>
                    </h2>
                )}
                <button onClick={refreshBoard}>Refresh Board</button>
            </div>
        </div>
    );
};
export default TicTacToe;
