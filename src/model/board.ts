export enum Player {
    X = 1,
    O = 2
}

export enum Blank {
    Blank = 0
}

export type SquareState = Player | Blank;

export interface BoardCoordinate {
    x: number;
    y: number;
}

export interface Rank {
    rank: number;
}

export type BoardCoordinateWithRank = BoardCoordinate & Rank;

export const SquareStateToChar: { [key: number]: string } = {
    0: '.',
    1: 'X',
    2: 'O'
};

const CharToSquareState: { [key: string]: SquareState } = {
    X: Player.X,
    O: Player.O
};

// bit masks for checking for complete lines for X, shift left once to get bit masks for O
const LineBitMasks = [
    0b000000000000010101, // [0, 1, 2]
    0b000000010101000000, // [3, 4, 5]
    0b010101000000000000, // [6, 7, 8]
    0b000001000001000001, // [0, 3, 6]
    0b000100000100000100, // [1, 4, 7]
    0b010000010000010000, // [2, 5, 8]
    0b010000000100000001, // [0, 4, 8]
    0b000001000100010000 // [2, 4, 6]
];

const Indices = Array.from({ length: 9 }, (_, i) => i); // 0 to 8

export type Board = number; // the entire board state is represented by a single integer

export const makeBoard = (): Board => 0;

export const boardToString = (board: Board): string =>
    [0, 1, 2]
        .map((y: number) => [0, 1, 2].map((x: number) => SquareStateToChar[getSquareState(board, { x, y })]).join(''))
        .join('\n');

export const boardFromString = (s: string): Board => {
    return s.split(/\s+/).reduce<Board>((board: Board, line: string, y: number): Board => {
        return line.split('').reduce<Board>((board: Board, ch: string, x: number): Board => {
            return setSquareState(board, { x, y }, CharToSquareState[ch] || Blank.Blank);
        }, board);
    }, makeBoard());
};

const coordinateToIndex = (coordinate: BoardCoordinate): number => coordinate.y * 3 + coordinate.x;

export const indexToCoordinate = (index: number): BoardCoordinate => ({ x: index % 3, y: Math.floor(index / 3) });

const getSquareStateByIndex = (board: Board, index: number): SquareState => (board >> (2 * index)) & 3;

export const getSquareState = (board: Board, coordinate: BoardCoordinate): SquareState =>
    getSquareStateByIndex(board, coordinateToIndex(coordinate));

export const setSquareState = (board: Board, coordinate: BoardCoordinate, squareState: SquareState): Board => {
    if (getSquareState(board, coordinate) !== Blank.Blank) {
        throw new Error('Tried to play on a non-empty square');
    }
    return board | (squareState << (2 * coordinateToIndex(coordinate)));
};

const countFilledSquares = (board: Board): number =>
    Indices.reduce((count, i) => count + (getSquareStateByIndex(board, i) ? 1 : 0), 0);

export const nextPlayer = (board: Board): Player => (countFilledSquares(board) % 2 === 0 ? Player.X : Player.O);

export const playMove = (board: Board, coordinate: BoardCoordinate): Board =>
    setSquareState(board, coordinate, (nextPlayer(board) as unknown) as SquareState);

export const getWinner = (board: Board): { player: Player; line: number[] } | void => {
    for (const player of [Player.X, Player.O]) {
        for (const b of LineBitMasks) {
            const lineMask = b << (player - 1);
            if ((board & lineMask) === lineMask) {
                const line = [];
                for (let m = lineMask, i = 0; m > 0; m >>= 2, i += 1) {
                    if ((m & 3) !== 0) {
                        line.push(i);
                    }
                }
                return { player, line };
            }
        }
    }
};

type RankFunction = (board: Board, index: number) => number;

const defaultRankFunction = (board: Board, index: number) => countPossibleWinsByIndex(board, index) + Math.random();

export const getAvailableMoves = (
    board: Board,
    rankFunction: RankFunction = defaultRankFunction
): BoardCoordinateWithRank[] =>
    Indices.reduce(
        (a, i) =>
            getSquareStateByIndex(board, i) === Blank.Blank
                ? [...a, { ...indexToCoordinate(i), rank: rankFunction(board, i) }]
                : a,
        []
    );

export const getAvailableMovesRanked = (
    board: Board,
    rankFunction: RankFunction = defaultRankFunction
): BoardCoordinateWithRank[] =>
    getAvailableMoves(board, rankFunction).sort((coordinate1, coordinate2) => coordinate2.rank - coordinate1.rank);

export const countPossibleWinsByIndex = (board: Board, index: number) => {
    const player = nextPlayer(board);
    return LineBitMasks.reduce((c, b) => {
        const lineMask = b << (2 - player);
        const indexMask = 0b11 << (index * 2);
        return (indexMask & lineMask) !== 0 && (board & lineMask) === 0 ? c + 1 : c;
    }, 0);
};

export const countPossibleWins = (board: Board, coordinate: BoardCoordinate) =>
    countPossibleWinsByIndex(board, coordinateToIndex(coordinate));
