import {
    Blank,
    Board,
    countEmptySquares,
    getSquareState,
    getWinner,
    makeBoard,
    negamax,
    nextPlayer,
    playMove,
    SquareStateToChar,
    TreeNode
} from './model';
import { BoardRenderer, canvas, eventCoordinateToCanvas, size } from './canvas';
import { Coordinate, sameCoordinates } from './model/coordinate';

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
    touchStartSquare?: Coordinate;
    gameTree: TreeNode;

    private static eventHandlers = (game: Game): GameEventHandler[] => [
        { element: document, type: 'play', listener: game.playEventHandler },
        { element: document, type: 'undo', listener: game.undoEventHandler },
        { element: document, type: 'restart', listener: game.restartEventHandler },
        { element: canvas, type: 'mouseleave', listener: game.mouseOutHandler },
        { element: canvas, type: 'mousemove', listener: game.mouseMoveHandler },
        { element: canvas, type: 'click', listener: game.mouseClickHandler },
        { element: canvas, type: 'touchstart', listener: game.touchStartHandler },
        { element: canvas, type: 'touchmove', listener: game.touchMoveHandler },
        { element: canvas, type: 'touchend', listener: game.touchEndHandler }
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

    // --- Managing game state ---

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
        } else if (countEmptySquares(this.board) === 0) {
            this.updateMessage(`DRAW!`);
        } else {
            this.updateMessage(`${SquareStateToChar[nextPlayer(this.board)]} to play`);
        }
    }

    private updateMessage(message: string) {
        document.getElementById('message').innerText = message;
    }

    // --- Event handlers ---

    private playEventHandler = () => {
        this.selectedSquare = undefined;
        const { move } = this.gameTree.children[0] || {};
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

    // --- UI event handlers ---

    private mouseOutHandler = () => {
        this.selectedSquare = undefined;
    };

    private mouseMoveHandler = ({ pageX, pageY }: MouseEvent) => {
        this.onSelect(this.eventCoordinateToSquare({ x: pageX, y: pageY }));
    };

    private mouseClickHandler = ({ pageX, pageY }: MouseEvent) => {
        this.onAction(this.eventCoordinateToSquare({ x: pageX, y: pageY }));
    };

    private touchStartHandler = (e: TouchEvent) => {
        if (e.touches && e.touches.length > 0) {
            const { clientX, clientY } = e.touches[0];
            this.touchStartSquare = this.selectedSquare;
            this.onSelect(this.eventCoordinateToSquare({ x: clientX, y: clientY }));
        }
        e.preventDefault();
    };

    private touchMoveHandler = (e: TouchEvent) => {
        if (e.touches && e.touches.length > 0) {
            const { clientX, clientY } = e.touches[0];
            this.onSelect(this.eventCoordinateToSquare({ x: clientX, y: clientY }));
        }
        e.preventDefault();
    };

    private touchEndHandler = (e: TouchEvent) => {
        if (this.selectedSquare && sameCoordinates(this.selectedSquare, this.touchStartSquare)) {
            this.onAction(this.selectedSquare);
        }
        e.preventDefault();
    };

    private eventCoordinateToSquare(eventCoordinate: Coordinate) {
        return this.boardRenderer.canvasCoordinateToSquareCoordinate(eventCoordinateToCanvas(eventCoordinate));
    }

    private onSelect(square: Coordinate) {
        const selectedSquare = square && getSquareState(this.board, square) === Blank.Blank ? square : undefined;
        if (this.selectedSquare || selectedSquare) {
            if (!this.selectedSquare || !selectedSquare || !sameCoordinates(selectedSquare, this.selectedSquare)) {
                this.selectedSquare = selectedSquare;
                this.boardRenderer.clear();
                this.boardRenderer.draw(this.board, this.gameTree, this.selectedSquare);
            }
        }
    }

    private onAction(square: Coordinate) {
        if (!getWinner(this.board)) {
            if (sameCoordinates(square, this.selectedSquare)) {
                this.playMove(square);
                this.selectedSquare = undefined;
            } else {
                this.onSelect(square);
            }
        }
    }
}
