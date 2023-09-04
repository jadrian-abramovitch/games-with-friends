import { useEffect, useState } from 'react';
type CellState = 1 | 2 | typeof NaN;

const TOTAL_MOVES_PLAYER_O = 5;
const TOTAL_MOVES_PLAYER_X = 4;

const useCheckForWin = (board: number[][], turn: number) => {
    const boardAt = (i: number, j: number): CellState => {
        const row = board[i];
        if (row === undefined) throw new Error();
        return row[j] as CellState;
    };
    const [winner, setWinner] = useState<number>(NaN);
    useEffect(() => {
        let sum = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const squareValue = boardAt(i, j);
                if (isNaN(squareValue)) continue;
                sum += boardAt(i, j);
            }
        }
        for (let i = 0; i < 3; i++) {
            // horizontal win
            if ((boardAt(i, 0) + boardAt(i, 1) + boardAt(i, 2)) % 3 === 0) {
                setWinner(3 - turn);
            }
            // vertical win
            if ((boardAt(0, i) + boardAt(1, i) + boardAt(2, i)) % 3 === 0) {
                setWinner(3 - turn);
            }
        }
        //diagonal wins
        if ((boardAt(0, 0) + boardAt(1, 1) + boardAt(2, 2)) % 3 === 0) {
            setWinner(3 - turn);
        }
        if ((boardAt(0, 2) + boardAt(1, 1) + boardAt(2, 0)) % 3 === 0) {
            setWinner(3 - turn);
        }
        // Draw -- all tiles played and no winner
        if (sum === 2 * TOTAL_MOVES_PLAYER_O + 1 * TOTAL_MOVES_PLAYER_X) {
            setWinner(0);
        }
    }, [JSON.stringify(board), turn]);
    return winner;
};

export default useCheckForWin;
