({

    data: [],

    dimensions: {
        count: 'sum_end_date',
        team: 'team_name',
        Y: 'year_end_date',
        Q: 'quarter_end_date',
        M: 'month_end_date'
    },

    // RECT(DIM(1, team), RECT(DIM(M, count), POINT(M, count, color, size, shape)))
    // RECT(DIM(Proj, Team), RECT(DIM(CycleTime,Effort), POINT(CycleTime,Effort)))

    coords: [
        {
            type: 'RECT',
            axes: [
                { axis: 1 },
                { axis: 'team', axisType: 'nominal', label: 'PLAN TEAMS' }
            ],
            unit: [
                {
                    type: 'RECT',
                    // implicit filter
                    filter: function (srcData, axesFilter) {
                        return this.rec.team === axesFilter.team;
                    },
                    // transform data if needed
                    transform: function () {
                        this.rec.count = this.rec.count * 2;
                        return this.rec;
                    },
                    axes: [
                        [{ axis: 'M', axisType: 'time', format: d3.time.format('%b') }],
                        { axis: 'count', axisType: 'logarithmic' }
                    ],
                    unit: [
                        {
                            axes: [
                                { axis: 'M', axisType: 'time', format: d3.time.format('%b') },
                                { axis: 'count', axisType: 'logarithmic' }
                            ],
                            unit: [
                                {
                                    type: 'BAR',
                                    color: '',
                                    size: '',
                                    shape: '',
                                    position: [
                                        'M',
                                        'count'
                                    ]
                                },
                                {
                                    type: 'line'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
})