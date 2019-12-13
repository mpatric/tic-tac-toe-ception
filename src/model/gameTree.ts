import {
    Board,
    BoardCoordinateWithRank,
    boardToString,
    getAvailableMovesRanked,
    getWinner,
    nextPlayer,
    Player,
    playMove
} from './board';

export interface TreeNode {
    children: TreeNode[];
    board: Board;
    move: BoardCoordinateWithRank;
    score?: number;
}

const minAlphaBetaCutoffDepth = 5;

export const negamax = (
    board: Board,
    lastMoveWithRank: BoardCoordinateWithRank = undefined,
    player: Player = nextPlayer(board),
    depth = 1,
    alpha = -Infinity,
    beta = Infinity
): TreeNode => {
    const winner = getWinner(board);
    if (winner) {
        const score = Math.floor(((winner.player === player ? 1 : -1) * 100.0) / depth);
        return {
            children: [],
            move: lastMoveWithRank,
            board,
            score
        };
    }

    const moves = getAvailableMovesRanked(board);
    if (moves.length === 0) {
        return {
            children: [],
            move: lastMoveWithRank,
            board,
            score: 0
        };
    }

    let maxScore = alpha;
    let children: TreeNode[] = [];
    const otherPlayer = 3 - player;
    for (const move of moves) {
        const child = negamax(playMove(board, move), move, otherPlayer, depth + 1, -beta, -alpha);
        children = [...children, child];
        maxScore = Math.max(maxScore, -child.score);
        alpha = maxScore;
        if (depth >= minAlphaBetaCutoffDepth && alpha >= beta) {
            break;
        }
    }
    const sortedChildren = children.sort((a, b) => a.score - b.score); // sort descending by -score
    return {
        children: sortedChildren,
        move: lastMoveWithRank,
        board,
        score: alpha
    };
};
