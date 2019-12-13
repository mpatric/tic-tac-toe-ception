import { boardFromString, makeBoard, negamax } from '../../src/model';

describe('game tree', () => {
    it.skip('builds the game tree for the full game space', () => {
        let board = makeBoard();
        board = boardFromString('XOX\n.OO\n.X.');
        const gameTree = negamax(board);
        console.log(gameTree);

        // const printNode = (node: TreeNode, level = 0) => {
        //     const spacer = level === 0 ? '' : new Array(level * 2).fill(' ').join('');
        //     console.log(`${spacer}${level}.. SCORE: ${node.score}\n` + boardToString(node.board).split('\n').map(line => `${spacer} ${line}`).join('\n'));
        //     node.children.forEach(child => printNode(child, level + 1));
        // }
        //
        // printNode(gameTree);
    });
});
