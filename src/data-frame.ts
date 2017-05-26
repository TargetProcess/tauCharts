import * as utils from './utils/utils';

interface DataFrameOptions {
    key?: string;
    pipe?: string;
    source?: string;
    units?: string;
}

export class DataFrame {

    key;
    pipe;
    source;
    units;

    _frame;
    _data;
    _pipeReducer;

    constructor({key, pipe, source, units}: DataFrameOptions, dataSource, transformations = {}) {

        this.key = key;
        this.pipe = pipe || [];
        this.source = source;
        this.units = units;

        this._frame = {key, source, pipe: this.pipe};
        this._data = dataSource;
        this._pipeReducer = (data, pipeCfg) => transformations[pipeCfg.type](data, pipeCfg.args);
    }

    hash() {
        var x = [this._frame.pipe, this._frame.key, this._frame.source]
            .map((x) => JSON.stringify(x))
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