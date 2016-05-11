import {Interval} from './element.interval';

export class StackedInterval extends Interval {

    constructor(config) {
        config.guide = (config.guide || {});
        config.guide.stack = true;
        super(config);
    }
}