import {
    Blank,
    Board,
    getSquareState,
    getWinner,
    makeBoard,
    negamax,
    nextPlayer,
    playMove,
    SquareState,
    SquareStateToChar,
    TreeNode
} from './model';
import { BoardRenderer, canvas, screenToCanvas, size } from './canvas';

export interface Coordinate {
    x: number;
    y: number;
}

type EventListener = (event?: UIEvent) => void;

interface GameEventHandler {
    element: HTMLDocument | HTMLElement;
    type: string;
    listener: EventListener;
}

export class Game {
    board: Board;
    history: Board[];
    boardRenderer: BoardRenderer;
    selectedSquare?: Coordinate;
    gameTree: TreeNode;

    private static eventHandlers = (game: Game): GameEventHandler[] => [
        { element: document, type: 'play', listener: game.playEventHandler },
        { element: document, type: 'undo', listener: game.undoEventHandler },
        { element: document, type: 'restart', listener: game.restartEventHandler },
        { element: canvas, type: 'mousemove', listener: game.mouseMoveHandler },
        { element: canvas, type: 'mouseleave', listener: game.mouseOutHandler },
        { element: canvas, type: 'mouseup', listener: game.mouseClickHandler }
    ];

    constructor() {
        this.boardRenderer = new BoardRenderer(canvas.getContext('2d'), { x: 0, y: 0, size });
        this.newBoard();
    }

    public start() {
        Game.eventHandlers(this).forEach(({ element, type, listener }) => element.addEventListener(type, listener));
    }

    public stop() {
        Game.eventHandlers(this).forEach(({ element, type, listener }) => element.removeEventListener(type, listener));
    }

    private updateBoard(board: Board) {
        this.board = board;
        this.gameTree = negamax(this.board);
        this.boardRenderer.clear();
        this.boardRenderer.draw(this.board, this.gameTree, this.selectedSquare);
        this.updateMessageForGameState();
    }

    private newBoard() {
        this.history = [];
        this.updateBoard(makeBoard());
    }

    private playMove(move: Coordinate) {
        this.history.push(this.board);
        this.updateBoard(playMove(this.board, move));
    }

    private undoMove() {
        const previousBoard = this.history.pop();
        if (previousBoard !== undefined) {
            this.updateBoard(previousBoard);
        }
    }

    private updateMessageForGameState() {
        const winner = getWinner(this.board);
        if (winner) {
            this.updateMessage(`${SquareStateToChar[winner.player]} WINS!`);
        } else {
            this.updateMessage(`${SquareStateToChar[nextPlayer(this.board)]} to play`);
        }
    }

    private updateMessage(message: string) {
        document.getElementById('message').innerText = message;
    }

    private playEventHandler = () => {
        this.selectedSquare = undefined;
        const move = this.gameTree.children[0]?.move;
        move && this.playMove(move);
    };

    private undoEventHandler = () => {
        this.selectedSquare = undefined;
        this.undoMove();
    };

    private restartEventHandler = () => {
        this.selectedSquare = undefined;
        this.newBoard();
    };

    private mouseEventToCoordinates(e: MouseEvent): Coordinate {
        return {
            x: e.pageX - canvas.offsetLeft,
            y: e.pageY - canvas.offsetTop
        };
    }

    private selectSquare(square: Coordinate) {
        const selectedSquare = square && getSquareState(this.board, square) === Blank.Blank ? square : undefined;
        if (this.selectedSquare || selectedSquare) {
            if (
                !this.selectedSquare ||
                !selectedSquare ||
                selectedSquare.x !== this.selectedSquare.x ||
                selectedSquare.y !== this.selectedSquare.y
            ) {
                this.selectedSquare = selectedSquare;
                this.boardRenderer.clear();
                this.boardRenderer.draw(this.board, this.gameTree, this.selectedSquare);
            }
        }
    }

    private mouseMoveHandler = (e: MouseEvent) => {
        const coordinate = this.mouseEventToCoordinates(e);
        const square = this.boardRenderer.canvasCoordinateToSquareCoordinate(screenToCanvas(coordinate));
        this.selectSquare(square);
    };

    private mouseOutHandler = () => {
        this.selectedSquare = undefined;
    };

    private mouseClickHandler = (e: MouseEvent) => {
        if (!getWinner(this.board)) {
            const coordinate = this.mouseEventToCoordinates(e);
            const square = this.boardRenderer.canvasCoordinateToSquareCoordinate(screenToCanvas(coordinate));
            if (this.selectedSquare && square.x === this.selectedSquare.x && square.y === this.selectedSquare.y) {
                this.playMove(square);
                this.selectedSquare = undefined;
            } else {
                this.selectSquare(square);
            }
        }
    };
}
