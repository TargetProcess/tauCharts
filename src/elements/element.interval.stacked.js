import {Interval} from './element.interval';

export class StackedInterval extends Interval {

    constructor(config) {
        config.stack = true;
        super(config);
    }
}