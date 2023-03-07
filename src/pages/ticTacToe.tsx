import { type NextPage } from 'next';
import { useState } from 'react';
import { useEffect } from 'react';

const ticTacToe: NextPage = () => {
    const getBoard = () => {
        const gameBoard: number[][] = [
            [NaN, NaN, NaN],
            [NaN, NaN, NaN],
            [NaN, NaN, NaN],
        ];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                gameBoard[i][j] = (
                    <button
                        onClick={() => handleClick(i, j)}
                        key={i.toString() + '-' + j.toString()}
                        className="m-4 h-32 w-32 bg-sky-500"
                    >
                        <h2>{getSymbol(i, j)}</h2>
                    </button>
                );
            }
        }
        return gameBoard;
    };
    const [turn, setTurn] = useState(1); // 1 -> player 'o's, 2 -> x's
    const [board, setBoard] = useState([
        [NaN, NaN, NaN],
        [NaN, NaN, NaN],
        [NaN, NaN, NaN],
    ]);
    const [winner, setWinner] = useState(NaN);

    const getSymbol = (i: number, j: number) => {
        if (isNaN(board[i][j])) return '';
        return board[i][j] == 1 ? 'O' : 'X';
    };

    const handleClick = (i: number, j: number) => {
        let oldBoard = board;
        oldBoard[i][j] = turn;
        setBoard(oldBoard);
        console.log(board);
        setTurn(3 - turn);
    };

    const sendWinMessage = () => {
        setWinner(turn);
        window.alert(`Player ${turn} wins!`);
    };

    const renderNextTurn = () => {
        return (
            <div>
                <h2>Next Turn: {turn === 1 ? 'O' : 'X'}</h2>
            </div>
        );
    };

    useEffect(() => {
        for (let i = 0; i < 3; i++) {
            // horizontal win
            if ((board[i][0] + board[i][1] + board[i][2]) % 3 === 0) {
                sendWinMessage();
            }
            // vertical win
            if ((board[0][i] + board[1][i] + board[2][i]) % 3 === 0) {
                sendWinMessage();
            }
        }
        //diagonal wins
        if ((board[0][0] + board[1][1] + board[2][2]) % 3 === 0) {
            sendWinMessage();
        }
        if ((board[0][2] + board[1][1] + board[2][0]) % 3 === 0) {
            sendWinMessage();
        }
    }, [JSON.stringify(board)]);
    return (
        <>
            {isNaN(winner) && renderNextTurn()}
            {isNaN(winner) &&
                getBoard().map((row, index) => (
                    <div key={index.toString()}>{row}</div>
                ))}
            {!isNaN(winner) && <h2>Game Over</h2>}
        </>
    );
};

export default ticTacToe;
