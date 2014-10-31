var sizeScale = function (values, maxSize) {
    values = _.filter(values, _.isFinite);

    var domain = [Math.min.apply(null, values), Math.max.apply(null, values)];
    var domainWidth = Math.max(1, domain[1] / domain[0]);

    var range = [Math.max(1, maxSize / (Math.log(domainWidth) + 1)), maxSize];

    return d3
        .scale
        .linear()
        .range(range)
        .domain(domain);
};

export {sizeScale};