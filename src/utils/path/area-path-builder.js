import {getPolyline} from './line-builder';

export default function getAreaPath(points) {
    const ways = points
        .reduce((memo, d) => {
            memo.dir.push({x: d.x, y: d.y});
            memo.rev.unshift({x: d.x0, y: d.y0});
            return memo;
        },
        {
            dir: [],
            rev: []
        });

    if (points.length < 2) {
        return '';
    }
    var dir = getPolyline(ways.dir);
    var rev = getPolyline(ways.rev);
    var path = `${dir} L${rev.slice(1)} Z`;

    return path;
}