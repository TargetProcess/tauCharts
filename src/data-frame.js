import {utils} from './utils/utils';

export class DataFrame {

    constructor({key: key, pipe: pipe, source: source}, dataSource, transformations) {

        this.frame = {key, source, pipe: pipe || []};
        this.trans = transformations;
        this.data = dataSource;
        this.pipeReducer = (data, pipeCfg) => this.trans[pipeCfg.type](data, pipeCfg.args);
    }

    hash() {
        var x = [this.frame.pipe, this.frame.key, this.frame.source]
            .map(JSON.stringify)
            .join('');

        return utils.generateHash(x);
    }

    take() {
        return this
            .frame
            .pipe
            .reduce(this.pipeReducer, this.data);
    }

    partByDims(dims) {

        var leaveDimsInWhereArgsOrEx = (f) => {
            var r = {};
            if (f.type === 'where' && f.args) {
                r.type = f.type;
                r.args = dims.reduce(
                    (memo, d) => {
                        if (f.args.hasOwnProperty(d)) {
                            memo[d] = f.args[d];
                        }
                        return memo;
                    },
                    {});
            } else {
                r = f;
            }

            return r;
        };

        return this
            .frame
            .pipe
            .map(leaveDimsInWhereArgsOrEx)
            .reduce(this.pipeReducer, this.data);
    }
}