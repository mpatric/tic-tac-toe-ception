import { Board, CoordinateWithRank, getAvailableMovesRanked, getWinner, nextPlayer, Player, playMove } from './board';

export interface TreeNode {
    children: TreeNode[];
    board: Board;
    move: CoordinateWithRank;
    score?: number;
}

export const negamax = (
    board: Board,
    minAlphaBetaCutoffDepth = 5,
    lastMoveWithRank: CoordinateWithRank = undefined,
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
        const child = negamax(
            playMove(board, move),
            minAlphaBetaCutoffDepth,
            move,
            otherPlayer,
            depth + 1,
            -beta,
            -alpha
        );
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
