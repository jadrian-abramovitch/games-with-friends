import { type NextPage } from 'next'

const getBoard = () => {
    const gameBoard: number[][] = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ]
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            gameBoard[i][j] = (
                <button
                    onClick={() => console.log('click')}
                    key={i.toString() + '-' + j.toString()}
                    className="m-4 h-32 w-32 bg-sky-500"
                ></button>
            )
        }
    }
    return gameBoard
}

const ticTacToe: NextPage = () => {
    return getBoard().map((row, index) => (
        <div key={index.toString()}>{row}</div>
    ))
}

export default ticTacToe
