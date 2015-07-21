import {utils} from './utils/utils';

export class DataFrame {

    constructor({key: key, pipe: pipe, source: source, units: units}, dataSource, transformations = {}) {

        this.key = key;
        this.pipe = pipe;
        this.source = source;
        this.units = units;

        this._frame = {key, source, pipe: pipe || []};
        this._data = dataSource;
        this._pipeReducer = (data, pipeCfg) => transformations[pipeCfg.type](data, pipeCfg.args);
    }

    hash() {
        var x = [this._frame.pipe, this._frame.key, this._frame.source]
            .map(JSON.stringify)
            .join('');

        return utils.generateHash(x);
    }

    full() {
        return this._data;
    }

    part(pipeMapper = (x => x)) {
        return this
            ._frame
            .pipe
            .map(pipeMapper)
            .reduce(this._pipeReducer, this._data);
    }
}