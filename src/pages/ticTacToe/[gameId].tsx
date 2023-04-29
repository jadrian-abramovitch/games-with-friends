'use client';

import { type NextPage } from 'next';
import { useState } from 'react';
import { useEffect } from 'react';
import { api } from '~/utils/api';

const TOTAL_MOVES_PLAYER_O = 5;
const TOTAL_MOVES_PLAYER_X = 4;

type CellState = 1 | 2 | typeof NaN;

const TicTacToe: NextPage = () => {
    // okay I think I'm starting to understand the patterns here. This page needs to accept the gameId from the route
    // since each player is running this code on their browser. They then set their own cookie, and register to the server
    // and the server records the cookies of each player in the game
    // how to make sure only 2 players can connect? How to make joining same game as friend simple?


    //const hello = api.ticTacToe.startNewGame.useQuery({ player1Id: 'test id' });
    //console.log('hello: ', typeof hello.data?.gameId);
    // this code can't live here because of re-renders

    const registerToGame = api.ticTacToe.joinGame.useMutation();
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
        const temp = registerToGame.mutate({gameId: 1, player2Id: 'test'});
        console.log(temp);
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

    if (!getCookie("testCookie")) {
        setCookie("testCookie", "someValue", 5);
    }
    console.log(getCookie("testCookie"));
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
                        Game Over, player {map[3 - winner]} wins!
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
