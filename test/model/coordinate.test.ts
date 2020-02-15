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
});
