import {
    Blank,
    Board,
    getSquareState,
    getWinner,
    indexToCoordinate,
    nextPlayer,
    Player,
    playMove,
    SquareState
} from '../model/board';
import { negamax, TreeNode } from '../model';
import { Coordinate } from '../model/coordinate';

interface Region {
    x: number;
    y: number;
    size: number;
}

type PieceDrawer = (region: Region, strokeStyle: string) => void;

const maxDrawDepth = 5;

export class BoardRenderer {
    readonly canvasContext: CanvasRenderingContext2D;
    readonly region: Region;
    readonly drawableRegion: Region;
    readonly squareDrawableRegions: Region[][];
    readonly boardPadding: number;
    readonly depth: number;
    readonly alpha: number;

    constructor(canvasContext: CanvasRenderingContext2D, region: Region, depth = 1) {
        this.canvasContext = canvasContext;
        this.region = region;
        this.boardPadding = region.size / 60 + 1;
        this.drawableRegion = this.createDrawableRegion(region);
        this.squareDrawableRegions = this.createSquareDrawableRegions(this.drawableRegion);
        this.depth = depth;
        this.alpha = 0.25 + 0.75 / this.depth;
    }

    private createDrawableRegion(region: Region): Region {
        const x = region.x + this.boardPadding;
        const y = region.y + this.boardPadding;
        const size = region.size - 2 * this.boardPadding;
        return { x, y, size };
    }

    private createSquareDrawableRegions(region: Region): Region[][] {
        const third = region.size / 3;
        return [0, 1, 2].map(y =>
            [0, 1, 2].map(x => ({
                x: region.x + third * x,
                y: region.y + third * y,
                size: third
            }))
        );
    }

    public clear() {
        const { x, y, size } = this.region;
        this.canvasContext.clearRect(x, y, x + size, y + size);
    }

    public draw(board: Board, gameTree: TreeNode, selectedSquare?: Coordinate) {
        const renderChild = (child: TreeNode) => {
            const region = this.squareDrawableRegions[child.move.y][child.move.x];
            const childRenderer = new BoardRenderer(this.canvasContext, region, this.depth + 1);
            childRenderer.draw(child.board, child, child.move);
        };

        if (this.depth > 1) {
            this.drawOutline();
        }
        if (this.depth === 1) {
            this.drawSquares(board);
        }
        this.drawPieces(board);
        this.drawWinner(board);

        if (selectedSquare) {
            if (this.depth === 1) {
                if (getSquareState(board, selectedSquare) === Blank.Blank && !getWinner(board)) {
                    this.drawHighlight(board, selectedSquare, nextPlayer(board));
                    const boardWithMovePlayed = playMove(board, selectedSquare);
                    const childGameTree = negamax(boardWithMovePlayed);
                    childGameTree.children.forEach(renderChild);
                }
            } else {
                this.drawHighlight(board, selectedSquare, 3 - nextPlayer(board));
            }
        }

        if (this.depth > 1 && this.depth < maxDrawDepth && gameTree) {
            gameTree.children.forEach(renderChild);
        }
    }

    private drawOutline() {
        const padding = (this.drawableRegion.x - this.region.x) * 0.75;
        const lineWidth = Math.ceil(2 / this.depth);
        const strokeStyle = `rgba(0, 0, 0, ${this.alpha})`;
        const x = this.region.x + padding;
        const y = this.region.y + padding;
        const size = this.region.size - 2 * padding;
        this.canvasContext.beginPath();
        this.canvasContext.lineWidth = lineWidth;
        this.canvasContext.strokeStyle = strokeStyle;
        this.canvasContext.rect(x, y, size, size);
        this.canvasContext.stroke();
    }

    private drawSquares(board: Board) {
        for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
                const { x, y, size } = this.squareDrawableRegions[sy][sx];
                this.canvasContext.beginPath();
                this.canvasContext.lineWidth = 1;
                this.canvasContext.strokeStyle = '#999';
                this.canvasContext.rect(x, y, size, size);
                this.canvasContext.stroke();
            }
        }
    }

    private drawPieces(board: Board) {
        const strokeStyle = `rgba(0, 0, 0, ${this.alpha})`;
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                const squareState = getSquareState(board, { x, y });
                this.drawerForPiece(squareState)(this.squareDrawableRegions[y][x], strokeStyle);
            }
        }
    }

    private drawerForPiece = (squareState: SquareState): PieceDrawer => {
        const squareStateToPieceDrawer: { [key: number]: any } = {
            [Player.X]: this.drawX,
            [Player.O]: this.drawO,
            [Blank.Blank]: () => {}
        };
        return squareStateToPieceDrawer[squareState];
    };

    private drawO = ({ x, y, size }: Region, strokeStyle: string) => {
        const lineWidth = Math.ceil(4 / this.depth);
        const padding = this.boardPadding;
        this.canvasContext.beginPath();
        this.canvasContext.arc(x + size / 2, y + size / 2, (size - padding) / 2, 0, 2 * Math.PI, false);
        this.canvasContext.lineWidth = lineWidth;
        this.canvasContext.strokeStyle = strokeStyle;
        this.canvasContext.stroke();
    };

    private drawX = ({ x, y, size }: Region, strokeStyle: string) => {
        const lineWidth = Math.ceil(4 / this.depth);
        const padding = this.boardPadding;
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(x + padding, y + padding);
        this.canvasContext.lineTo(x + size - padding, y + size - padding);
        this.canvasContext.moveTo(x + padding, y + size - padding);
        this.canvasContext.lineTo(x + size - padding, y + padding);
        this.canvasContext.lineWidth = lineWidth;
        this.canvasContext.strokeStyle = strokeStyle;
        this.canvasContext.stroke();
    };

    private drawHighlight(board: Board, selectedSquare: Coordinate, player: Player) {
        const region = this.squareDrawableRegions[selectedSquare.y][selectedSquare.x];
        const strokeStyle = `#e74c3c`;
        this.drawerForPiece(player)(region, strokeStyle);
    }

    public drawWinner(board: Board, strokeStyle = '#3498db') {
        const winner = getWinner(board);
        if (winner) {
            const lineWidth = Math.ceil(10 / this.depth);
            const { line } = winner;
            const { x: startX, y: startY } = indexToCoordinate(line[0]);
            const { x: endX, y: endY } = indexToCoordinate(line[2]);
            const { x: x1, y: y1, size } = this.squareDrawableRegions[startY][startX];
            const { x: x2, y: y2 } = this.squareDrawableRegions[endY][endX];
            const dx = size * (x1 === x2 ? 0.5 : x1 < x2 ? 0.25 : 0.75);
            const dy = size * (y1 === y2 ? 0.5 : y1 < y2 ? 0.25 : 0.75);
            this.canvasContext.beginPath();
            this.canvasContext.moveTo(x1 + dx, y1 + dy);
            this.canvasContext.lineTo(x2 + size - dx, y2 + size - dy);
            this.canvasContext.lineWidth = lineWidth;
            this.canvasContext.strokeStyle = strokeStyle;
            this.canvasContext.stroke();
        }
    }

    public canvasCoordinateToSquareCoordinate({ x, y }: Coordinate): Coordinate | undefined {
        for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
                const { x: rx, y: ry, size: rs } = this.squareDrawableRegions[sy][sx];
                if (x >= rx && x < rx + rs && y >= ry && y < ry + rs) {
                    return { x: sx, y: sy };
                }
            }
        }
    }
}
