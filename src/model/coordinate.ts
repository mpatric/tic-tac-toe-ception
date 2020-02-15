export interface Coordinate {
    x: number;
    y: number;
}

export const sameCoordinates = (first: Coordinate, second: Coordinate): boolean => {
    return first.x === second.x && first.y === second.y;
};
