class Unit {

    constructor(unitRef) {
        this.unitRef = unitRef;
    }

    value() {
        return this.unitRef;
    }

    clone() {
        return JSON.parse(JSON.stringify(this.unitRef));
    }

    traverse(iterator) {

        var fnTraverse = (node, fnIterator, parentNode) => {
            fnIterator(node, parentNode);
            (node.units || []).map((x) => fnTraverse(x, fnIterator, node));
        };

        fnTraverse(this.unitRef, iterator, null);
        return this;
    }

    reduce(iterator, memo) {
        var r = memo;
        this.traverse((unit, parent) => (r = iterator(r, unit, parent)));
        return r;
    }

    addFrame(frameConfig) {
        this.unitRef.frames = this.unitRef.frames || [];

        frameConfig.key.__layerid__ = ['L', (new Date()).getTime(), this.unitRef.frames.length].join('');
        frameConfig.source = (frameConfig.hasOwnProperty('source') ?
            (frameConfig.source) :
            (this.unitRef.expression.source));

        frameConfig.pipe = frameConfig.pipe || [];

        this.unitRef.frames.push(frameConfig);
        return this;
    }

    addTransformation(name, params) {
        this.unitRef.transformation = this.unitRef.transformation || [];
        this.unitRef.transformation.push({type: name, args: params});
        return this;
    }

    isCoordinates() {
        return ((this.unitRef.type || '').toUpperCase().indexOf('COORDS.') === 0);
    }

    isElementOf(typeOfCoordinates) {

        if (this.isCoordinates()) {
            return false;
        }

        var xType = (this.unitRef.type || '');
        var parts = (xType.split('/'));

        if (parts.length === 1) {
            parts.unshift('RECT'); // by default
        }

        return (parts[0].toUpperCase() === typeOfCoordinates.toUpperCase());
    }
}

export {Unit};
