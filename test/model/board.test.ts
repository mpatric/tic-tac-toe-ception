import {
    Blank,
    Board,
    boardFromString,
    boardToString,
    countPossibleWinsByIndex,
    getAvailableMoves,
    getAvailableMovesRanked,
    getSquareState,
    getWinner,
    indexToCoordinate,
    makeBoard,
    nextPlayer,
    Player,
    playMove,
    setSquareState,
    SquareState,
    SquareStateToChar
} from '../../src/model';

const allIndices = Array.from({ length: 9 }, (_, i) => i);
const allCoordinates = allIndices.map(index => indexToCoordinate(index));

describe('tic-tac-toe board', () => {
    describe('getting and setting square states', () => {
        it('should get empty spaces for all co-ordinates on a blank board', () => {
            const board = makeBoard();
            allCoordinates.forEach(({ x, y }) => {
                expect(getSquareState(board, { x, y })).toEqual(Blank.Blank);
            });
        });

        it('should set the state of the specified square only', () => {
            allCoordinates.forEach(coordinate => {
                const player = randomPlayer();
                const board = setSquareState(makeBoard(), coordinate, player);
                allCoordinates.forEach(testCoordinate => {
                    if (coordinate.x === testCoordinate.x && coordinate.y === testCoordinate.y) {
                        expect(getSquareState(board, testCoordinate)).toEqual(player);
                    } else {
                        expect(getSquareState(board, testCoordinate)).toEqual(Blank.Blank);
                    }
                });
            });
        });

        it('should set the state of multiple squares', () => {
            let board = makeBoard();
            const coordinates = shuffle(allCoordinates).map(coordinate => ({ ...coordinate, player: randomPlayer() }));
            coordinates.forEach(({ x, y, player }) => {
                board = setSquareState(board, { x, y }, player);
            });
            coordinates.forEach(({ x, y, player }) => {
                expect(getSquareState(board, { x, y })).toEqual(player);
            });
        });
    });

    describe('conversion to and from string', () => {
        it('from an empty board', () => {
            const board = makeBoard();
            expect(boardToString(board)).toEqual('...\n...\n...');
        });

        it('should return the same board when converted to string and back', () => {
            const iterations = 10;
            for (let i = 1; i < iterations; i++) {
                const board = allCoordinates.reduce(
                    (board, { x, y }) => setSquareState(board, { x, y }, randomSquareState()),
                    makeBoard()
                );
                expect(boardFromString(boardToString(board))).toEqual(board);
            }
        });
    });

    describe('playing moves', () => {
        it('should be X to play first', () => {
            const board = makeBoard();
            expect(nextPlayer(board)).toBe(Player.X);
        });

        it('should place alternate player pieces on the board', () => {
            let board = makeBoard();
            let currentPlayer = Player.X;
            const swapPlayer = (player: Player) => (player === Player.X ? Player.O : Player.X);
            allCoordinates.forEach(({ x, y }) => {
                board = setSquareState(board, { x, y }, currentPlayer);
                currentPlayer = swapPlayer(currentPlayer);
            });
            expect(boardToString(board)).toEqual('XOX\nOXO\nXOX');
        });

        it('should place alternate player pieces on the board when playing moves', () => {
            const board = allCoordinates.reduce((board, { x, y }) => {
                return playMove(board, { x, y });
            }, makeBoard());
            expect(boardToString(board)).toEqual('XOX\nOXO\nXOX');
        });

        it('should not allow a piece to be played on a non-empty square', () => {
            allCoordinates.forEach(({ x, y }) => {
                const boardWithX = setSquareState(makeBoard(), { x, y }, Player.X);
                expect(() => setSquareState(boardWithX, { x, y }, Player.X)).toThrowError(
                    'Tried to play on a non-empty square'
                );
                expect(() => setSquareState(boardWithX, { x, y }, Player.O)).toThrowError(
                    'Tried to play on a non-empty square'
                );
                const boardWithO = setSquareState(makeBoard(), { x, y }, Player.O);
                expect(() => setSquareState(boardWithO, { x, y }, Player.X)).toThrowError(
                    'Tried to play on a non-empty square'
                );
                expect(() => setSquareState(boardWithO, { x, y }, Player.O)).toThrowError(
                    'Tried to play on a non-empty square'
                );
            });
        });
    });

    describe('getting valid moves', () => {
        it('should return a list of valid moves as co-ordinates', () => {
            const dummyRankFunction = (board: Board, index: number) => index;
            expectArraysWithSameElements(getAvailableMoves(makeBoard(), dummyRankFunction), [
                { x: 0, y: 0, rank: 0 },
                { x: 1, y: 0, rank: 1 },
                { x: 2, y: 0, rank: 2 },
                { x: 0, y: 1, rank: 3 },
                { x: 1, y: 1, rank: 4 },
                { x: 2, y: 1, rank: 5 },
                { x: 0, y: 2, rank: 6 },
                { x: 1, y: 2, rank: 7 },
                { x: 2, y: 2, rank: 8 }
            ]);
        });

        it('should return a list of valid moves as co-ordinates, ordered descending by rank ', () => {
            const dummyRankFunction = (board: Board, index: number) =>
                10 * indexToCoordinate(index).x + indexToCoordinate(index).y;
            expect(getAvailableMovesRanked(makeBoard(), dummyRankFunction)).toEqual([
                { x: 2, y: 2, rank: 22 },
                { x: 2, y: 1, rank: 21 },
                { x: 2, y: 0, rank: 20 },
                { x: 1, y: 2, rank: 12 },
                { x: 1, y: 1, rank: 11 },
                { x: 1, y: 0, rank: 10 },
                { x: 0, y: 2, rank: 2 },
                { x: 0, y: 1, rank: 1 },
                { x: 0, y: 0, rank: 0 }
            ]);
        });
    });

    describe('ranking moves', () => {
        it('should count how many three-in-a-rows for player X a square could take part in on an empty board', () => {
            const board = makeBoard();
            const expectedCounts = [3, 2, 3, 2, 4, 2, 3, 2, 3];
            expectedCounts.map((expectedCount, i) => {
                expect(countPossibleWinsByIndex(board, i)).toEqual(expectedCount);
            });
        });

        it('should count how many three-in-a-rows for player O a square could take part in on a board with just the centre played', () => {
            const board = boardFromString('...\n.X.\n...');
            const expectedCounts = [2, 1, 2, 1, 0, 1, 2, 1, 2];
            expectedCounts.map((expectedCount, i) => {
                expect(countPossibleWinsByIndex(board, i)).toEqual(expectedCount);
            });
        });

        it('should count how many three-in-a-rows for player X a square could take part in on a board with two corners played', () => {
            const board = boardFromString('X..\n...\n..O');
            const expectedCounts = [2, 2, 2, 2, 3, 1, 2, 1, 0];
            expectedCounts.map((expectedCount, i) => {
                expect(countPossibleWinsByIndex(board, i)).toEqual(expectedCount);
            });
        });

        it('should count how many three-in-a-rows for player O a square could take part in on a board with three edges played', () => {
            const board = boardFromString('.O.\n..X\n.X.');
            const expectedCounts = [3, 1, 2, 1, 2, 0, 2, 0, 1];
            expectedCounts.map((expectedCount, i) => {
                expect(countPossibleWinsByIndex(board, i)).toEqual(expectedCount);
            });
        });

        it('should count how many three-in-a-rows for player X a square could take part in on a board with one blank square', () => {
            const board = boardFromString('XOX\nOXO\nOX.');
            const expectedCounts = [1, 0, 0, 0, 1, 0, 0, 0, 1];
            expectedCounts.map((expectedCount, i) => {
                expect(countPossibleWinsByIndex(board, i)).toEqual(expectedCount);
            });
        });

        it('should count how many three-in-a-rows for player O a square could take part in on a full board', () => {
            const board = boardFromString('OXX\nOXO\nOXX');
            const expectedCounts = [1, 0, 0, 1, 0, 0, 1, 0, 0];
            expectedCounts.map((expectedCount, i) => {
                expect(countPossibleWinsByIndex(board, i)).toEqual(expectedCount);
            });
        });
    });

    describe('winning', () => {
        it('should have no winner on an empty board', () => {
            expect(getWinner(makeBoard())).toBeUndefined();
        });

        it('should have a winner when three horizontal pieces in a row are set', () => {
            expect(getWinner(boardFromString('XXX\n...\n...'))).toEqual({ player: Player.X, line: [0, 1, 2] });
            expect(getWinner(boardFromString('...\nXXX\n...'))).toEqual({ player: Player.X, line: [3, 4, 5] });
            expect(getWinner(boardFromString('...\n...\nXXX'))).toEqual({ player: Player.X, line: [6, 7, 8] });
            expect(getWinner(boardFromString('OOO\n...\n...'))).toEqual({ player: Player.O, line: [0, 1, 2] });
            expect(getWinner(boardFromString('...\nOOO\n...'))).toEqual({ player: Player.O, line: [3, 4, 5] });
            expect(getWinner(boardFromString('...\n...\nOOO'))).toEqual({ player: Player.O, line: [6, 7, 8] });
        });

        it('should have a winner when three vertical pieces in a row are set', () => {
            expect(getWinner(boardFromString('X..\nX..\nX..'))).toEqual({ player: Player.X, line: [0, 3, 6] });
            expect(getWinner(boardFromString('.X.\n.X.\n.X.'))).toEqual({ player: Player.X, line: [1, 4, 7] });
            expect(getWinner(boardFromString('..X\n..X\n..X'))).toEqual({ player: Player.X, line: [2, 5, 8] });
            expect(getWinner(boardFromString('O..\nO..\nO..'))).toEqual({ player: Player.O, line: [0, 3, 6] });
            expect(getWinner(boardFromString('.O.\n.O.\n.O.'))).toEqual({ player: Player.O, line: [1, 4, 7] });
            expect(getWinner(boardFromString('..O\n..O\n..O'))).toEqual({ player: Player.O, line: [2, 5, 8] });
        });

        it('should have a winner when three diagonal pieces in a row are set', () => {
            expect(getWinner(boardFromString('X..\n.X.\n..X'))).toEqual({ player: Player.X, line: [0, 4, 8] });
            expect(getWinner(boardFromString('..X\n.X.\nX..'))).toEqual({ player: Player.X, line: [2, 4, 6] });
            expect(getWinner(boardFromString('O..\n.O.\n..O'))).toEqual({ player: Player.O, line: [0, 4, 8] });
            expect(getWinner(boardFromString('..O\n.O.\nO..'))).toEqual({ player: Player.O, line: [2, 4, 6] });
        });
    });
});

function expectArraysWithSameElements(arr1: any[], arr2: any[]) {
    expect(arr1.length).toEqual(arr2.length);
    arr1.forEach(el => {
        expect(arr2).toContainEqual(el);
    });
}

function randomPlayer(): Player {
    return 1 + Math.floor(2 * Math.random());
}

function randomSquareState(): SquareState {
    return Math.floor(3 * Math.random());
}

function shuffle(arr: any[]): any[] {
    return arr.reduce((a, elem) => {
        a.splice(Math.floor((a.length + 1) * Math.random()), 0, elem);
        return a;
    }, []);
}
