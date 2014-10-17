#What is a facet chart
If you want to map several dimensions to a single coordinate, you will have a faceted chart as a result. For example, you want to have City and Population on Y axis and Time on X axis.

#Examples

```
var facet2x2 = {
        dimensions: {
            project: { scaleType: 'ordinal' },
            team: { scaleType: 'ordinal' },
            cycleTime: { scaleType: 'linear' },
            effort: { scaleType: 'linear' }
        },
        unit: {
            type: 'COORDS.RECT',
            guide: {
                padding: {l: 152, b: 48, r: 0, t: 0},
                x: {label: { text: 'Projects', padding: 32}},
                y: {label: { text: 'Teams', padding: 120}}
            },
            x: 'project',
            y: 'team',
            unit: [
                {
                    type: 'COORDS.RECT',
                    guide: {
                        showGridLines: 'xy',
                        padding: { l:54, b:28, r:16, t:16 },
                        x: {padding: 8, label: ''},
                        y: {padding: 8, label: 'effort'}
                    },
                    x: 'cycleTime',
                    y: 'effort',
                    unit: [
                        {
                            type: 'ELEMENT.POINT',
                            color: 'effort',
                            size: 'cycleTime',
                            shape: null
                        }
                    ]
                }
            ]
        }
    };
```
