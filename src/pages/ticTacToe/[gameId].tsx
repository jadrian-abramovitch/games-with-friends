import { type NextPage } from 'next';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUserIp } from '../../utils/useUserIp';

const TOTAL_MOVES_PLAYER_O = 5;
const TOTAL_MOVES_PLAYER_X = 4;

type CellState = 1 | 2 | typeof NaN;

const TicTacToe: NextPage = () => {
    const ip = useUserIp();
    console.log('ip: ', ip);
    const router = useRouter();
    const { gameId } = router.query;

    console.log({ gameId });

    const getBoard = () => {
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
    };
    const [turn, setTurn] = useState<number>(1); // 1 ->'O's, 2 -> x's
    const [board, setBoard] = useState<number[][]>([
        [NaN, NaN, NaN],
        [NaN, NaN, NaN],
        [NaN, NaN, NaN],
    ]);
    const [winner, setWinner] = useState(NaN);

    const map: { [key: CellState]: string } = {
        NaN: '?',
        1: 'O',
        2: 'X',
    };
    
    const getBoardValue = (i: number, j: number): CellState => {
        const row = board[i];
        if (row === undefined) throw new Error();
        return row[j] as CellState;
    }

    const handleClick = (i: number, j: number) => {
        const oldBoard = board;
        const rowToUpdate = oldBoard[i];
        if (rowToUpdate === undefined) throw new Error('Board is empty');
        rowToUpdate[j] = turn;
        oldBoard[i] = rowToUpdate;
        setBoard(oldBoard);
        setTurn(3 - turn); // flips between 2 and 1
    };

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
                    getBoard().map((row, index) => (
                        <div key={index.toString()}>{row}</div>
                    ))}
                {!isNaN(winner) && winner !== 0 && (
                    <h2 className="text-center text-4xl">
                        Game Over, player {winner} wins!
                    </h2>
                )}
                {!isNaN(winner) && winner === 0 && (
                    <h2 className="text-center text-4xl">Game Over, Draw!</h2>
                )}
                {isNaN(winner) && (
                    <h2 className="text-center text-4xl">
                        Next Turn: {map[turn]}
                    </h2>
                )}
            </div>
        </div>
    );
};

export default TicTacToe;
