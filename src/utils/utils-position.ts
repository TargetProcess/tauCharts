import {
    ClosestElementInfo
} from '../definitions';

/**
 * Returns closest point info.
 * If multiple points have the same position,
 * chooses one of points according to angle
 * of vector from point to cursor.
 */
export function getClosestPointInfo(cursorX: number, cursorY: number, bestMatchItems: ClosestElementInfo[]): ClosestElementInfo {
    const items = bestMatchItems
        .sort((a, b) => (a.distance === b.distance ?
            (a.secondaryDistance - b.secondaryDistance) :
            (a.distance - b.distance)
        ));

    const largerDistIndex = items.findIndex((d) => (
        (d.distance !== items[0].distance) ||
        (d.secondaryDistance !== items[0].secondaryDistance)
    ));
    const sameDistItems = (largerDistIndex < 0 ? items : items.slice(0, largerDistIndex));
    if (sameDistItems.length === 1) {
        return sameDistItems[0];
    }
    const mx = (sameDistItems.reduce((sum, item) => sum + item.x, 0) / sameDistItems.length);
    const my = (sameDistItems.reduce((sum, item) => sum + item.y, 0) / sameDistItems.length);
    const angle = (Math.atan2(my - cursorY, mx - cursorX) + Math.PI);
    const closest = sameDistItems[Math.round((sameDistItems.length - 1) * angle / 2 / Math.PI)];
    return closest;
}
