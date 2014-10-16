import {nodeMap} from './node-map';
var TNodeVisitorFactory = (function () {
    return function (unitType) {

        if (!nodeMap.hasOwnProperty(unitType)) {
            throw new Error('Unknown unit type: ' + unitType);
        }

        return nodeMap[unitType];
    };

})();

export {TNodeVisitorFactory};
