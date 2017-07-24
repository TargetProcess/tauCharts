dev.spec({
    description: 'Cumulative flow diagram (stacked area with tooltip showing diff vs previous period)',
    type: 'stacked-area',
    'x': 'endDate',
    'y': 'count',
    'color': 'entityState',
    dimensions: {
        'endDate': {
            type: 'measure',
            scale: 'time'
        },
        'count': {
            type: 'measure',
            scale: 'linear'
        },
        'effort': {
            type: 'measure',
            scale: 'linear'
        },
        'entityState': {
            type: 'category',
            scale: 'ordinal',
            order: getOrderedStates().reverse()
        }
    },
    data: getCFDData(),
    plugins: [
        Taucharts.api.plugins.get('legend')(),
        Taucharts.api.plugins.get('diff-tooltip')({
            fields: [
                'entityStateName',
                'entityStateID'
            ]
        })
    ],
    guide: {
        showGridLines: 'y',
        'x': {
            timeInterval: 'week',
            nice: false
        },
        'color': {
            brewer: function (state) {
                var states = getOrderedStates();
                var stateOrder = states.indexOf(state);
                var color = d3.scaleLinear()
                    .domain(splitEvenly([0, states.length], 8))
                    .range([
                        d3.hsl(260, 0.5, 0.8),
                        d3.hsl(300, 0.5, 0.8),
                        d3.hsl(340, 0.5, 0.8),
                        d3.hsl(20, 0.5, 0.8),
                        d3.hsl(60, 0.5, 0.8),
                        d3.hsl(100, 0.5, 0.8),
                        d3.hsl(140, 0.5, 0.8),
                        d3.hsl(180, 0.5, 0.8)
                    ]);

                return color(stateOrder);
            }
        }
    },
    settings: {
        utcTime: true
    }
});

dev.spec({
    description: 'Diff by periods horizontally',
    type: 'horizontal-stacked-bar',
    'y': 'endDate',
    'x': 'count',
    'color': 'entityState',
    dimensions: {
        'endDate': {
            type: 'measure',
            scale: 'time'
        },
        'count': {
            type: 'measure',
            scale: 'linear'
        },
        'effort': {
            type: 'measure',
            scale: 'linear'
        },
        'entityState': {
            type: 'category',
            scale: 'ordinal',
            order: getOrderedStates().reverse()
        }
    },
    data: getCFDData(),
    plugins: [
        Taucharts.api.plugins.get('legend')(),
        Taucharts.api.plugins.get('diff-tooltip')({
            fields: [
                'entityStateName',
                'entityStateID'
            ]
        })
    ],
    guide: {
        showGridLines: 'x',
        'y': {
            timeInterval: 'week',
            nice: false
        },
        'color': {
            brewer: function (state) {
                var states = getOrderedStates();
                var stateOrder = states.indexOf(state);
                var color = d3.scaleLinear()
                    .domain(splitEvenly([0, states.length], 8))
                    .range([
                        d3.hsl(260, 0.5, 0.8),
                        d3.hsl(300, 0.5, 0.8),
                        d3.hsl(340, 0.5, 0.8),
                        d3.hsl(20, 0.5, 0.8),
                        d3.hsl(60, 0.5, 0.8),
                        d3.hsl(100, 0.5, 0.8),
                        d3.hsl(140, 0.5, 0.8),
                        d3.hsl(180, 0.5, 0.8)
                    ]);

                return color(stateOrder);
            }
        }
    },
    settings: {
        utcTime: true
    }
});

function getOrderedStates() {
    return [
        'Create(UserStory)',
        'Specification(UserStory)',
        'Prepare(UserStory)',
        'Prepare(Bug)',
        'Development(UserStory)',
        'Development(Bug)',
        'Code review(UserStory)',
        'Code review(Bug)',
        'Validation(UserStory)',
        'Validation(Bug)',
        'Deployment(UserStory)',
        'Deployment(Bug)',
        'Final'
    ];
}

function splitEvenly(domain, parts) {
    var min = domain[0];
    var max = domain[1];
    var segment = (max - min) / (parts - 1);
    var chunks = utils.range(parts - 2).map(function (n) {
        return min + segment * (n + 1);
    });
    return [min].concat(chunks).concat(max);
}

function getCFDData() {
    return [
        {
            'endDate': '2015-11-25T00:00:00.000Z',
            'effort': 26,
            'count': 5,
            'entityStateID': 153,
            'entityStateGroup': 'A cadrer',
            'entityStateOrder': 0,
            'numericPriority': 0,
            'entityStateName': 'A cadrer',
            'entityTypeName': 'UserStory',
            'entityStateType': 'Initial',
            'entityState': 'Create(UserStory)'
        },
        {
            'endDate': '2015-11-25T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 172,
            'entityStateGroup': 'Sp?cification',
            'entityStateOrder': 1,
            'numericPriority': 0.75,
            'entityStateName': 'Sp?cification',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Specification(UserStory)'
        },
        {
            'endDate': '2015-11-25T00:00:00.000Z',
            'effort': 0,
            'count': 2,
            'entityStateID': 304,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.4375,
            'entityStateName': 'Prepare',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(Bug)'
        },
        {
            'endDate': '2015-11-25T00:00:00.000Z',
            'effort': 11,
            'count': 4,
            'entityStateID': 173,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.875,
            'entityStateName': 'Prepare',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(UserStory)'
        },
        {
            'endDate': '2015-11-25T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 218,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 0.875,
            'entityStateName': 'Development',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Development(Bug)'
        },
        {
            'endDate': '2015-11-25T00:00:00.000Z',
            'effort': 3,
            'count': 1,
            'entityStateID': 154,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 1,
            'entityStateName': 'Development',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Development(UserStory)'
        },
        {
            'endDate': '2015-11-25T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 219,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.25,
            'entityStateName': 'Code review',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(Bug)'
        },
        {
            'endDate': '2015-11-25T00:00:00.000Z',
            'effort': 26,
            'count': 2,
            'entityStateID': 161,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.5,
            'entityStateName': 'Code review',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(UserStory)'
        },
        {
            'endDate': '2015-11-25T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 167,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.5,
            'entityStateName': 'Validation',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(Bug)'
        },
        {
            'endDate': '2015-11-25T00:00:00.000Z',
            'effort': 10,
            'count': 2,
            'entityStateID': 162,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.75,
            'entityStateName': 'Validation',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(UserStory)'
        },
        {
            'endDate': '2015-11-25T00:00:00.000Z',
            'entityState': 'Final',
            'entityStateOrder': 7,
            'count': 1,
            'effort': 0
        },
        {
            'endDate': '2015-12-02T00:00:00.000Z',
            'effort': 26,
            'count': 5,
            'entityStateID': 153,
            'entityStateGroup': 'A cadrer',
            'entityStateOrder': 0,
            'numericPriority': 0,
            'entityStateName': 'A cadrer',
            'entityTypeName': 'UserStory',
            'entityStateType': 'Initial',
            'entityState': 'Create(UserStory)'
        },
        {
            'endDate': '2015-12-02T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 304,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.4375,
            'entityStateName': 'Prepare',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(Bug)'
        },
        {
            'endDate': '2015-12-02T00:00:00.000Z',
            'effort': 8,
            'count': 3,
            'entityStateID': 173,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.875,
            'entityStateName': 'Prepare',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(UserStory)'
        },
        {
            'endDate': '2015-12-02T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 218,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 0.875,
            'entityStateName': 'Development',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Development(Bug)'
        },
        {
            'endDate': '2015-12-02T00:00:00.000Z',
            'effort': 11,
            'count': 2,
            'entityStateID': 154,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 1,
            'entityStateName': 'Development',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Development(UserStory)'
        },
        {
            'endDate': '2015-12-02T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 219,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.25,
            'entityStateName': 'Code review',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(Bug)'
        },
        {
            'endDate': '2015-12-02T00:00:00.000Z',
            'effort': 5,
            'count': 1,
            'entityStateID': 161,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.5,
            'entityStateName': 'Code review',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(UserStory)'
        },
        {
            'endDate': '2015-12-02T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 167,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.5,
            'entityStateName': 'Validation',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(Bug)'
        },
        {
            'endDate': '2015-12-02T00:00:00.000Z',
            'effort': 10,
            'count': 2,
            'entityStateID': 162,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.75,
            'entityStateName': 'Validation',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(UserStory)'
        },
        {
            'endDate': '2015-12-02T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 220,
            'entityStateGroup': 'Deployment',
            'entityStateOrder': 6,
            'numericPriority': 1.75,
            'entityStateName': 'Deployment',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Deployment(Bug)'
        },
        {
            'endDate': '2015-12-02T00:00:00.000Z',
            'entityState': 'Final',
            'entityStateOrder': 7,
            'count': 3,
            'effort': 24
        },
        {
            'endDate': '2015-12-09T00:00:00.000Z',
            'effort': 26,
            'count': 5,
            'entityStateID': 153,
            'entityStateGroup': 'A cadrer',
            'entityStateOrder': 0,
            'numericPriority': 0,
            'entityStateName': 'A cadrer',
            'entityTypeName': 'UserStory',
            'entityStateType': 'Initial',
            'entityState': 'Create(UserStory)'
        },
        {
            'endDate': '2015-12-09T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 304,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.4375,
            'entityStateName': 'Prepare',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(Bug)'
        },
        {
            'endDate': '2015-12-09T00:00:00.000Z',
            'effort': 8,
            'count': 3,
            'entityStateID': 173,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.875,
            'entityStateName': 'Prepare',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(UserStory)'
        },
        {
            'endDate': '2015-12-09T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 218,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 0.875,
            'entityStateName': 'Development',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Development(Bug)'
        },
        {
            'endDate': '2015-12-09T00:00:00.000Z',
            'effort': 3,
            'count': 1,
            'entityStateID': 154,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 1,
            'entityStateName': 'Development',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Development(UserStory)'
        },
        {
            'endDate': '2015-12-09T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 219,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.25,
            'entityStateName': 'Code review',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(Bug)'
        },
        {
            'endDate': '2015-12-09T00:00:00.000Z',
            'effort': 10,
            'count': 2,
            'entityStateID': 161,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.5,
            'entityStateName': 'Code review',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(UserStory)'
        },
        {
            'endDate': '2015-12-09T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 167,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.5,
            'entityStateName': 'Validation',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(Bug)'
        },
        {
            'endDate': '2015-12-09T00:00:00.000Z',
            'effort': 10,
            'count': 2,
            'entityStateID': 162,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.75,
            'entityStateName': 'Validation',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(UserStory)'
        },
        {
            'endDate': '2015-12-09T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 220,
            'entityStateGroup': 'Deployment',
            'entityStateOrder': 6,
            'numericPriority': 1.75,
            'entityStateName': 'Deployment',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Deployment(Bug)'
        },
        {
            'endDate': '2015-12-09T00:00:00.000Z',
            'entityState': 'Final',
            'entityStateOrder': 7,
            'count': 4,
            'effort': 32
        },
        {
            'endDate': '2015-12-16T00:00:00.000Z',
            'effort': 26,
            'count': 5,
            'entityStateID': 153,
            'entityStateGroup': 'A cadrer',
            'entityStateOrder': 0,
            'numericPriority': 0,
            'entityStateName': 'A cadrer',
            'entityTypeName': 'UserStory',
            'entityStateType': 'Initial',
            'entityState': 'Create(UserStory)'
        },
        {
            'endDate': '2015-12-16T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 304,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.4375,
            'entityStateName': 'Prepare',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(Bug)'
        },
        {
            'endDate': '2015-12-16T00:00:00.000Z',
            'effort': 8,
            'count': 3,
            'entityStateID': 173,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.875,
            'entityStateName': 'Prepare',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(UserStory)'
        },
        {
            'endDate': '2015-12-16T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 218,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 0.875,
            'entityStateName': 'Development',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Development(Bug)'
        },
        {
            'endDate': '2015-12-16T00:00:00.000Z',
            'effort': 3,
            'count': 1,
            'entityStateID': 154,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 1,
            'entityStateName': 'Development',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Development(UserStory)'
        },
        {
            'endDate': '2015-12-16T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 219,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.25,
            'entityStateName': 'Code review',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(Bug)'
        },
        {
            'endDate': '2015-12-16T00:00:00.000Z',
            'effort': 5,
            'count': 1,
            'entityStateID': 161,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.5,
            'entityStateName': 'Code review',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(UserStory)'
        },
        {
            'endDate': '2015-12-16T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 167,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.5,
            'entityStateName': 'Validation',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(Bug)'
        },
        {
            'endDate': '2015-12-16T00:00:00.000Z',
            'effort': 12,
            'count': 3,
            'entityStateID': 162,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.75,
            'entityStateName': 'Validation',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(UserStory)'
        },
        {
            'endDate': '2015-12-16T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 220,
            'entityStateGroup': 'Deployment',
            'entityStateOrder': 6,
            'numericPriority': 1.75,
            'entityStateName': 'Deployment',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Deployment(Bug)'
        },
        {
            'endDate': '2015-12-16T00:00:00.000Z',
            'effort': 5,
            'count': 1,
            'entityStateID': 163,
            'entityStateGroup': 'Deployment',
            'entityStateOrder': 6,
            'numericPriority': 1.875,
            'entityStateName': 'Deployment',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Deployment(UserStory)'
        },
        {
            'endDate': '2015-12-16T00:00:00.000Z',
            'entityState': 'Final',
            'entityStateOrder': 7,
            'count': 5,
            'effort': 35
        },
        {
            'endDate': '2015-12-23T00:00:00.000Z',
            'effort': 26,
            'count': 5,
            'entityStateID': 153,
            'entityStateGroup': 'A cadrer',
            'entityStateOrder': 0,
            'numericPriority': 0,
            'entityStateName': 'A cadrer',
            'entityTypeName': 'UserStory',
            'entityStateType': 'Initial',
            'entityState': 'Create(UserStory)'
        },
        {
            'endDate': '2015-12-23T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 304,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.4375,
            'entityStateName': 'Prepare',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(Bug)'
        },
        {
            'endDate': '2015-12-23T00:00:00.000Z',
            'effort': 8,
            'count': 1,
            'entityStateID': 173,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.875,
            'entityStateName': 'Prepare',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(UserStory)'
        },
        {
            'endDate': '2015-12-23T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 218,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 0.875,
            'entityStateName': 'Development',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Development(Bug)'
        },
        {
            'endDate': '2015-12-23T00:00:00.000Z',
            'effort': 3,
            'count': 1,
            'entityStateID': 154,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 1,
            'entityStateName': 'Development',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Development(UserStory)'
        },
        {
            'endDate': '2015-12-23T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 219,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.25,
            'entityStateName': 'Code review',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(Bug)'
        },
        {
            'endDate': '2015-12-23T00:00:00.000Z',
            'effort': 5,
            'count': 1,
            'entityStateID': 161,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.5,
            'entityStateName': 'Code review',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(UserStory)'
        },
        {
            'endDate': '2015-12-23T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 167,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.5,
            'entityStateName': 'Validation',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(Bug)'
        },
        {
            'endDate': '2015-12-23T00:00:00.000Z',
            'effort': 10,
            'count': 2,
            'entityStateID': 162,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.75,
            'entityStateName': 'Validation',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(UserStory)'
        },
        {
            'endDate': '2015-12-23T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 220,
            'entityStateGroup': 'Deployment',
            'entityStateOrder': 6,
            'numericPriority': 1.75,
            'entityStateName': 'Deployment',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Deployment(Bug)'
        },
        {
            'endDate': '2015-12-23T00:00:00.000Z',
            'entityState': 'Final',
            'entityStateOrder': 7,
            'count': 9,
            'effort': 49
        },
        {
            'endDate': '2015-12-30T00:00:00.000Z',
            'effort': 26,
            'count': 5,
            'entityStateID': 153,
            'entityStateGroup': 'A cadrer',
            'entityStateOrder': 0,
            'numericPriority': 0,
            'entityStateName': 'A cadrer',
            'entityTypeName': 'UserStory',
            'entityStateType': 'Initial',
            'entityState': 'Create(UserStory)'
        },
        {
            'endDate': '2015-12-30T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 304,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.4375,
            'entityStateName': 'Prepare',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(Bug)'
        },
        {
            'endDate': '2015-12-30T00:00:00.000Z',
            'effort': 8,
            'count': 1,
            'entityStateID': 173,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.875,
            'entityStateName': 'Prepare',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(UserStory)'
        },
        {
            'endDate': '2015-12-30T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 218,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 0.875,
            'entityStateName': 'Development',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Development(Bug)'
        },
        {
            'endDate': '2015-12-30T00:00:00.000Z',
            'effort': 3,
            'count': 1,
            'entityStateID': 154,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 1,
            'entityStateName': 'Development',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Development(UserStory)'
        },
        {
            'endDate': '2015-12-30T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 219,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.25,
            'entityStateName': 'Code review',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(Bug)'
        },
        {
            'endDate': '2015-12-30T00:00:00.000Z',
            'effort': 5,
            'count': 1,
            'entityStateID': 161,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.5,
            'entityStateName': 'Code review',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(UserStory)'
        },
        {
            'endDate': '2015-12-30T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 167,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.5,
            'entityStateName': 'Validation',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(Bug)'
        },
        {
            'endDate': '2015-12-30T00:00:00.000Z',
            'effort': 10,
            'count': 2,
            'entityStateID': 162,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.75,
            'entityStateName': 'Validation',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(UserStory)'
        },
        {
            'endDate': '2015-12-30T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 220,
            'entityStateGroup': 'Deployment',
            'entityStateOrder': 6,
            'numericPriority': 1.75,
            'entityStateName': 'Deployment',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Deployment(Bug)'
        },
        {
            'endDate': '2015-12-30T00:00:00.000Z',
            'entityState': 'Final',
            'entityStateOrder': 7,
            'count': 9,
            'effort': 49
        },
        {
            'endDate': '2016-01-06T00:00:00.000Z',
            'effort': 26,
            'count': 5,
            'entityStateID': 153,
            'entityStateGroup': 'A cadrer',
            'entityStateOrder': 0,
            'numericPriority': 0,
            'entityStateName': 'A cadrer',
            'entityTypeName': 'UserStory',
            'entityStateType': 'Initial',
            'entityState': 'Create(UserStory)'
        },
        {
            'endDate': '2016-01-06T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 304,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.4375,
            'entityStateName': 'Prepare',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(Bug)'
        },
        {
            'endDate': '2016-01-06T00:00:00.000Z',
            'effort': 8,
            'count': 1,
            'entityStateID': 173,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.875,
            'entityStateName': 'Prepare',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(UserStory)'
        },
        {
            'endDate': '2016-01-06T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 218,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 0.875,
            'entityStateName': 'Development',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Development(Bug)'
        },
        {
            'endDate': '2016-01-06T00:00:00.000Z',
            'effort': 3,
            'count': 1,
            'entityStateID': 154,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 1,
            'entityStateName': 'Development',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Development(UserStory)'
        },
        {
            'endDate': '2016-01-06T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 219,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.25,
            'entityStateName': 'Code review',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(Bug)'
        },
        {
            'endDate': '2016-01-06T00:00:00.000Z',
            'effort': 5,
            'count': 1,
            'entityStateID': 161,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.5,
            'entityStateName': 'Code review',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(UserStory)'
        },
        {
            'endDate': '2016-01-06T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 167,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.5,
            'entityStateName': 'Validation',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(Bug)'
        },
        {
            'endDate': '2016-01-06T00:00:00.000Z',
            'effort': 10,
            'count': 2,
            'entityStateID': 162,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.75,
            'entityStateName': 'Validation',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(UserStory)'
        },
        {
            'endDate': '2016-01-06T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 220,
            'entityStateGroup': 'Deployment',
            'entityStateOrder': 6,
            'numericPriority': 1.75,
            'entityStateName': 'Deployment',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Deployment(Bug)'
        },
        {
            'endDate': '2016-01-06T00:00:00.000Z',
            'entityState': 'Final',
            'entityStateOrder': 7,
            'count': 9,
            'effort': 49
        },
        {
            'endDate': '2016-01-13T00:00:00.000Z',
            'effort': 26,
            'count': 5,
            'entityStateID': 153,
            'entityStateGroup': 'A cadrer',
            'entityStateOrder': 0,
            'numericPriority': 0,
            'entityStateName': 'A cadrer',
            'entityTypeName': 'UserStory',
            'entityStateType': 'Initial',
            'entityState': 'Create(UserStory)'
        },
        {
            'endDate': '2016-01-13T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 304,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.4375,
            'entityStateName': 'Prepare',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(Bug)'
        },
        {
            'endDate': '2016-01-13T00:00:00.000Z',
            'effort': 8,
            'count': 1,
            'entityStateID': 173,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.875,
            'entityStateName': 'Prepare',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(UserStory)'
        },
        {
            'endDate': '2016-01-13T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 218,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 0.875,
            'entityStateName': 'Development',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Development(Bug)'
        },
        {
            'endDate': '2016-01-13T00:00:00.000Z',
            'effort': 3,
            'count': 1,
            'entityStateID': 154,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 1,
            'entityStateName': 'Development',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Development(UserStory)'
        },
        {
            'endDate': '2016-01-13T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 219,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.25,
            'entityStateName': 'Code review',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(Bug)'
        },
        {
            'endDate': '2016-01-13T00:00:00.000Z',
            'effort': 5,
            'count': 1,
            'entityStateID': 161,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.5,
            'entityStateName': 'Code review',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(UserStory)'
        },
        {
            'endDate': '2016-01-13T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 167,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.5,
            'entityStateName': 'Validation',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(Bug)'
        },
        {
            'endDate': '2016-01-13T00:00:00.000Z',
            'effort': 10,
            'count': 2,
            'entityStateID': 162,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.75,
            'entityStateName': 'Validation',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(UserStory)'
        },
        {
            'endDate': '2016-01-13T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 220,
            'entityStateGroup': 'Deployment',
            'entityStateOrder': 6,
            'numericPriority': 1.75,
            'entityStateName': 'Deployment',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Deployment(Bug)'
        },
        {
            'endDate': '2016-01-13T00:00:00.000Z',
            'entityState': 'Final',
            'entityStateOrder': 7,
            'count': 9,
            'effort': 49
        },
        {
            'endDate': '2016-01-20T00:00:00.000Z',
            'effort': 26,
            'count': 5,
            'entityStateID': 153,
            'entityStateGroup': 'A cadrer',
            'entityStateOrder': 0,
            'numericPriority': 0,
            'entityStateName': 'A cadrer',
            'entityTypeName': 'UserStory',
            'entityStateType': 'Initial',
            'entityState': 'Create(UserStory)'
        },
        {
            'endDate': '2016-01-20T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 304,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.4375,
            'entityStateName': 'Prepare',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(Bug)'
        },
        {
            'endDate': '2016-01-20T00:00:00.000Z',
            'effort': 13,
            'count': 3,
            'entityStateID': 173,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.875,
            'entityStateName': 'Prepare',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(UserStory)'
        },
        {
            'endDate': '2016-01-20T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 218,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 0.875,
            'entityStateName': 'Development',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Development(Bug)'
        },
        {
            'endDate': '2016-01-20T00:00:00.000Z',
            'effort': 3,
            'count': 1,
            'entityStateID': 154,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 1,
            'entityStateName': 'Development',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Development(UserStory)'
        },
        {
            'endDate': '2016-01-20T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 219,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.25,
            'entityStateName': 'Code review',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(Bug)'
        },
        {
            'endDate': '2016-01-20T00:00:00.000Z',
            'effort': 5,
            'count': 1,
            'entityStateID': 161,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.5,
            'entityStateName': 'Code review',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(UserStory)'
        },
        {
            'endDate': '2016-01-20T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 167,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.5,
            'entityStateName': 'Validation',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(Bug)'
        },
        {
            'endDate': '2016-01-20T00:00:00.000Z',
            'effort': 10,
            'count': 2,
            'entityStateID': 162,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.75,
            'entityStateName': 'Validation',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(UserStory)'
        },
        {
            'endDate': '2016-01-20T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 220,
            'entityStateGroup': 'Deployment',
            'entityStateOrder': 6,
            'numericPriority': 1.75,
            'entityStateName': 'Deployment',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Deployment(Bug)'
        },
        {
            'endDate': '2016-01-20T00:00:00.000Z',
            'entityState': 'Final',
            'entityStateOrder': 7,
            'count': 11,
            'effort': 52
        },
        {
            'endDate': '2016-01-27T00:00:00.000Z',
            'effort': 26,
            'count': 5,
            'entityStateID': 153,
            'entityStateGroup': 'A cadrer',
            'entityStateOrder': 0,
            'numericPriority': 0,
            'entityStateName': 'A cadrer',
            'entityTypeName': 'UserStory',
            'entityStateType': 'Initial',
            'entityState': 'Create(UserStory)'
        },
        {
            'endDate': '2016-01-27T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 304,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.4375,
            'entityStateName': 'Prepare',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(Bug)'
        },
        {
            'endDate': '2016-01-27T00:00:00.000Z',
            'effort': 8,
            'count': 2,
            'entityStateID': 173,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.875,
            'entityStateName': 'Prepare',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(UserStory)'
        },
        {
            'endDate': '2016-01-27T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 218,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 0.875,
            'entityStateName': 'Development',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Development(Bug)'
        },
        {
            'endDate': '2016-01-27T00:00:00.000Z',
            'effort': 3,
            'count': 1,
            'entityStateID': 154,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 1,
            'entityStateName': 'Development',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Development(UserStory)'
        },
        {
            'endDate': '2016-01-27T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 219,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.25,
            'entityStateName': 'Code review',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(Bug)'
        },
        {
            'endDate': '2016-01-27T00:00:00.000Z',
            'effort': 5,
            'count': 1,
            'entityStateID': 161,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.5,
            'entityStateName': 'Code review',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(UserStory)'
        },
        {
            'endDate': '2016-01-27T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 167,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.5,
            'entityStateName': 'Validation',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(Bug)'
        },
        {
            'endDate': '2016-01-27T00:00:00.000Z',
            'effort': 10,
            'count': 2,
            'entityStateID': 162,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.75,
            'entityStateName': 'Validation',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(UserStory)'
        },
        {
            'endDate': '2016-01-27T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 220,
            'entityStateGroup': 'Deployment',
            'entityStateOrder': 6,
            'numericPriority': 1.75,
            'entityStateName': 'Deployment',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Deployment(Bug)'
        },
        {
            'endDate': '2016-01-27T00:00:00.000Z',
            'entityState': 'Final',
            'entityStateOrder': 7,
            'count': 12,
            'effort': 57
        },
        {
            'endDate': '2016-02-01T00:00:00.000Z',
            'effort': 26,
            'count': 5,
            'entityStateID': 153,
            'entityStateGroup': 'A cadrer',
            'entityStateOrder': 0,
            'numericPriority': 0,
            'entityStateName': 'A cadrer',
            'entityTypeName': 'UserStory',
            'entityStateType': 'Initial',
            'entityState': 'Create(UserStory)'
        },
        {
            'endDate': '2016-02-01T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 304,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.4375,
            'entityStateName': 'Prepare',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(Bug)'
        },
        {
            'endDate': '2016-02-01T00:00:00.000Z',
            'effort': 8,
            'count': 3,
            'entityStateID': 173,
            'entityStateGroup': 'Prepare',
            'entityStateOrder': 2,
            'numericPriority': 0.875,
            'entityStateName': 'Prepare',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Prepare(UserStory)'
        },
        {
            'endDate': '2016-02-01T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 218,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 0.875,
            'entityStateName': 'Development',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Development(Bug)'
        },
        {
            'endDate': '2016-02-01T00:00:00.000Z',
            'effort': 3,
            'count': 1,
            'entityStateID': 154,
            'entityStateGroup': 'Development',
            'entityStateOrder': 3,
            'numericPriority': 1,
            'entityStateName': 'Development',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Development(UserStory)'
        },
        {
            'endDate': '2016-02-01T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 219,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.25,
            'entityStateName': 'Code review',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(Bug)'
        },
        {
            'endDate': '2016-02-01T00:00:00.000Z',
            'effort': 5,
            'count': 1,
            'entityStateID': 161,
            'entityStateGroup': 'Code review',
            'entityStateOrder': 4,
            'numericPriority': 1.5,
            'entityStateName': 'Code review',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Code review(UserStory)'
        },
        {
            'endDate': '2016-02-01T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 167,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.5,
            'entityStateName': 'Validation',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(Bug)'
        },
        {
            'endDate': '2016-02-01T00:00:00.000Z',
            'effort': 10,
            'count': 2,
            'entityStateID': 162,
            'entityStateGroup': 'Validation',
            'entityStateOrder': 5,
            'numericPriority': 1.75,
            'entityStateName': 'Validation',
            'entityTypeName': 'UserStory',
            'entityStateType': 'InProgress',
            'entityState': 'Validation(UserStory)'
        },
        {
            'endDate': '2016-02-01T00:00:00.000Z',
            'effort': 0,
            'count': 1,
            'entityStateID': 220,
            'entityStateGroup': 'Deployment',
            'entityStateOrder': 6,
            'numericPriority': 1.75,
            'entityStateName': 'Deployment',
            'entityTypeName': 'Bug',
            'entityStateType': 'InProgress',
            'entityState': 'Deployment(Bug)'
        },
        {
            'endDate': '2016-02-01T00:00:00.000Z',
            'entityState': 'Final',
            'entityStateOrder': 7,
            'count': 12,
            'effort': 57
        }
    ];
};
