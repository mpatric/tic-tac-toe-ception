const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');
const size = Math.min(canvas.width, canvas.height);
const parent = canvas.parentElement;

window.onresize = resizeCanvas;
window.onload = resizeCanvas;

const MIN_CANVAS_SIZE = 320;

function resizeCanvas() {
    const size = Math.max(MIN_CANVAS_SIZE, Math.min(parent.offsetWidth, parent.offsetHeight));
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
}

interface Coordinate {
    x: number;
    y: number;
}

export const screenToCanvas = (screenCoordinate: Coordinate): Coordinate => {
    return {
        x: Math.round((screenCoordinate.x * size) / canvas.offsetWidth),
        y: Math.round((screenCoordinate.y * size) / canvas.offsetHeight)
    };
};

export const canvasToScreen = (canvasCoordinate: Coordinate): Coordinate => {
    return {
        x: Math.round((canvasCoordinate.x * canvas.offsetWidth) / size),
        y: Math.round((canvasCoordinate.y * canvas.offsetHeight) / size)
    };
};

export const eventCoordinateToCanvas = (eventCoordinate: Coordinate): Coordinate => {
    return screenToCanvas({
        x: eventCoordinate.x - canvas.offsetLeft,
        y: eventCoordinate.y - canvas.offsetTop
    });
};

export { canvas, size, context };
