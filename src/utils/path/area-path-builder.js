export default function getAreaPath(points) {
    const ways = points
        .reduce((memo, d) => {
            memo.dir.push(`${d.x},${d.y}`);
            memo.rev.unshift(`${d.x0},${d.y0}`);
            return memo;
        },
        {
            dir: [],
            rev: []
        });

    if (points.length < 2) {
        return '';
    }
    var path = `${ways.dir.join(' ')} ${ways.rev.join(' ')}`;

    return path;
}