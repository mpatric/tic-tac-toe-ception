import {
    Board,
    boardFromString,
    boardToString,
    countEmptySquares,
    getWinner,
    makeBoard,
    negamax,
    playMove,
    TreeNode,
} from '../../src/model';

describe('game tree', () => {
    it('should be built for the full game space', () => {
        const gameTree = negamax(makeBoard(), 5);
        expect(countNodes(gameTree, 1)).toEqual(9);
        expect(countNodes(gameTree, 2)).toEqual(9 + 9 * 8);
        expect(countNodes(gameTree, 3)).toEqual(9 + 9 * 8 + 9 * 8 * 7);
        expect(countNodes(gameTree, 4)).toEqual(9 + 9 * 8 + 9 * 8 * 7 + 9 * 8 * 7 * 6);
        expect(findDepth(gameTree)).toEqual(9);
    });

    it('always results in a tied game if the best move is always played', () => {
        const gamesToPlay = 10;
        for (let i = 0; i < gamesToPlay; i++) {
            const board = playGame(makeBoard());
            expect(getWinner(board)).toBeUndefined();
            expect(countEmptySquares(board)).toEqual(0);
        }
    });
});

function playGame(startBoard: Board): Board {
    let board = startBoard;
    while (true) {
        const gameTree = negamax(board);
        const move = gameTree.children[0]?.move;
        if (move) {
            board = playMove(board, move);
        } else {
            return board;
        }
    }
}

function countNodes(gameTree: TreeNode, maxDepth: number, depth = 1): number {
    if (maxDepth === depth) {
        return gameTree.children.length;
    } else {
        return gameTree.children.reduce((sum, child) => {
            return sum + countNodes(child, maxDepth, depth + 1);
        }, gameTree.children.length);
    }
}

function findDepth(gameTree: TreeNode, depth = 0): number {
    if (gameTree.children.length === 0) {
        return depth;
    } else {
        return gameTree.children.reduce((d, child) => Math.max(d, findDepth(child, depth + 1)), depth);
    }
}
