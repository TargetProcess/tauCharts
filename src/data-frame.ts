import * as utils from './utils/utils';
import {DataFilter, DataFrameObject, DataKey, DataTransformations, Unit} from './definitions';

export class DataFrame implements DataFrameObject {

    constructor({key, pipe, source, units}: DataFrameObject, dataSource, transformations: DataTransformations = {}) {

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

    key: DataKey;
    pipe: DataFilter[];
    source: string;
    units: Unit[];

    _frame: DataFrameObject;
    _data: any[];
    _pipeReducer: (data: any[], pipeCfg: DataFilter) => any[];
}