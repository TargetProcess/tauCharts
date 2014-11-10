import {utilsDraw} from './utils/utils-draw';

var inheritProps = (unit, root) => {
    unit.guide = unit.guide || {};
    unit.guide.padding = unit.guide.padding || {l: 0, t: 0, r: 0, b: 0};
    unit = _.defaults(unit, root);
    unit.guide = _.defaults(unit.guide, root.guide);
    return unit;
};

var SpecEngineTypeMap = {

    'DEFAULT': (spec) => {

        var fnTraverseTree = (specUnitRef) => {
            var root = utilsDraw.applyNodeDefaults(specUnitRef);
            var prop = _.omit(root, 'unit');
            (root.unit || []).forEach((unit) => fnTraverseTree(inheritProps(unit, prop)));
            return root;
        };

        fnTraverseTree(spec.unit);

        return spec;
    }
};

var SpecEngineFactory = {

    get: (typeName) => {
        return (SpecEngineTypeMap[typeName] || SpecEngineTypeMap.DEFAULT).bind(this);
    }

};

export {SpecEngineFactory};