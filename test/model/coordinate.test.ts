import { Coordinate, sameCoordinates } from '../../src/model/coordinate';

describe('coordinate', () => {
    it('should be the same when both x and y values are the same', () => {
        expect(sameCoordinates({ x: 34, y: 57 }, { x: 34, y: 57 })).toBeTruthy();
    });

    it('should not be the same unless both x and y values are the same', () => {
        expect(sameCoordinates({ x: 34, y: 57 }, { x: 0, y: 57 })).toBeFalsy();
        expect(sameCoordinates({ x: 34, y: 57 }, { x: 34, y: 0 })).toBeFalsy();
        expect(sameCoordinates({ x: 34, y: 57 }, { x: 57, y: 34 })).toBeFalsy();
    });

    it('should not be the same if one of the coordinates is null or undefined', () => {
        expect(sameCoordinates({ x: 34, y: 57 }, null)).toBeFalsy();
        expect(sameCoordinates(null, { x: 34, y: 57 })).toBeFalsy();
        expect(sameCoordinates({ x: 34, y: 57 }, undefined)).toBeFalsy();
        expect(sameCoordinates(undefined, { x: 34, y: 57 })).toBeFalsy();
    });

    it('should not be the same if one or both coordinates are null or undefined', () => {
        expect(sameCoordinates(null, null)).toBeFalsy();
        expect(sameCoordinates(null, undefined)).toBeFalsy();
        expect(sameCoordinates(undefined, null)).toBeFalsy();
        expect(sameCoordinates(undefined, undefined)).toBeFalsy();
    });
});
