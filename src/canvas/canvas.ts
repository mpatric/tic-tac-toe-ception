const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');
const size = Math.min(canvas.width, canvas.height);
const parent = canvas.parentElement;

window.onresize = resizeCanvas;
window.onload = resizeCanvas;

function resizeCanvas() {
    const size = Math.max(320, Math.min(parent.offsetWidth, parent.offsetHeight));
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
        x: Math.round(canvasCoordinate.x * canvas.offsetWidth / size),
        y: Math.round(canvasCoordinate.y * canvas.offsetHeight / size)
    }
};

export { canvas, size, context };
