import * as utils from './utils/utils';
import {
    DataFilter,
    DataKey,
    DataTransformations,
    Unit
} from './definitions';

interface DataFrameOptions {
    key?: DataKey;
    pipe?: DataFilter[];
    source?: string;
    units?: Unit[];
}

export class DataFrame implements DataFrameOptions {

    key: DataKey;
    pipe: DataFilter[];
    source: string;
    units: Unit[];

    _frame: {
        key: DataKey;
        source: string;
        pipe: DataFilter[];
    };
    _data: any[];
    _pipeReducer: (data: any[], pipeCfg: DataFilter) => any[];

    constructor({key, pipe, source, units}: DataFrameOptions, dataSource, transformations: DataTransformations = {}) {

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

    part(pipeMapper = ((x: DataFilter) => x)) {
        return this
            ._frame
            .pipe
            .map(pipeMapper)
            .reduce(this._pipeReducer, this._data);
    }
}