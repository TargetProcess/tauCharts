import {Point} from '../point';

export function getAreaPolygon(dirPoints: Point[], revPoints: Point[]) {

    if (dirPoints.length < 2) {
        return '';
    }

    const path: string = String.prototype.concat.apply('',
        dirPoints
            .concat(revPoints.slice().reverse())
            .map((d, i) => `${i === 0 ? '' : ' '}${d.x},${d.y}`)
    );

    return path;
}

export function getSmoothAreaPath(dirPoints: Point[], revPoints: Point[]) {

    if (dirPoints.length < 2) {
        return '';
    }

    const getPath = (points) => {
        const items = points.map((d, i) => {
            const command = ((i - 1) % 3 === 0 ? 'C' : '');
            return `${command}${d.x},${d.y} `;
        });
        return String.prototype.concat.apply('', items);
    };

    const dirPath = getPath(dirPoints);
    const revPath = getPath(revPoints.slice().reverse());
    const path = `M${dirPath}L${revPath}Z`;

    return path;
}