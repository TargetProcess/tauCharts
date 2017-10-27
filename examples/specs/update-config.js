(function () {

    dev.spec(getSpec());

    function updateSpecPlugin() {
        return {
            init: function (chart) {
                const node = document.createElement('div');
                const root = d3.select(node);
                root.append('span').append('strong')
                    .text('JSON:');
                root.append('textarea')
                    .property('value', '{}');
                root.append('button')
                    .text('Set data')
                    .on('click', function () {
                        const spec = getSpec();
                        const text = root.select('textarea').property('value');
                        const obj = JSON.parse(text || '{}');
                        if (obj.plugins && !Array.isArray(obj.plugins)) {
                            obj.plugins = Object.keys(obj.plugins).reduce(function (plugins, name) {
                                plugins.push(Taucharts.api.plugins.get(name)(obj.plugins[name]));
                                return plugins;
                            }, []);
                            obj.plugins.push(updateSpecPlugin());
                        }
                        const chartSpec = Object.assign(spec, obj);
                        chart.updateConfig(Object.assign(spec, obj));
                    });
                chart.insertToHeader(node);
                this.node = node;
            },
            destroy: function () {
                this.node.parentElement.removeChild(this.node);
            }
        };
    }

    function getSpec() {
        return {
            type: 'line',
            dimensions: {
                'Owner': {
                    type: 'category',
                    scale: 'ordinal'
                },
                'End Date': {
                    type: 'measure',
                    scale: 'time'
                },
                'Project': {
                    type: 'category',
                    scale: 'ordinal'
                },
                'Cycle Time': {
                    type: 'measure',
                    scale: 'linear'
                }
            },
            identity: 'id',
            color: 'Owner',
            x: [
                'Owner',
                'End Date'
            ],
            y: [
                'Project',
                'Cycle Time'
            ],
            data: getData(),
            settings: {
                utcTime: true,
            },
            plugins: [
                Taucharts.api.plugins.get('diff-tooltip')(),
                Taucharts.api.plugins.get('legend')(),
                Taucharts.api.plugins.get('crosshair')(),
                Taucharts.api.plugins.get('floating-axes')(),
                Taucharts.api.plugins.get('export-to')(),
                updateSpecPlugin()
            ]
        }
    }

    function getData() {
        return [
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-08-31T04:27:22.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0464467593
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-08-22T10:48:08.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0467939815
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-05-03T06:35:53.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0745601852
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-04-12T02:32:19.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.9009606481
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-05-03T03:31:03.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0486458333
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-06-05T06:28:52.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 32.9475231481
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-06-05T06:25:09.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 24.794525463
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-09-01T09:23:59.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0158217593
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-06-05T05:15:29.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 23.8833449074
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-08-21T04:17:51.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0374652778
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-08-22T08:37:12.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.211412037
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-09-01T08:18:27.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.1387615741
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-08-29T08:08:37.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0490046296
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-08-21T04:28:01.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0066087963
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-08-30T03:51:36.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.7755439815
            },
            {
                'Owner': 'Anastasiya Karabitskaya',
                'End Date': '2017-06-05T05:17:23.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-06-05T05:01:47.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 13.0088425926
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-07-06T09:49:14.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0332291667
            },
            {
                'Owner': 'Anastasiya Karabitskaya',
                'End Date': '2017-04-13T03:47:54.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0324421296
            },
            {
                'Owner': 'Anastasiya Karabitskaya',
                'End Date': '2017-04-12T07:54:09.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-07-14T06:56:43.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.1186458333
            },
            {
                'Owner': 'Anastasiya Karabitskaya',
                'End Date': '2017-07-10T08:33:59.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0653240741
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-07-05T10:15:20.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 5.0857638889
            },
            {
                'Owner': 'Anastasiya Karabitskaya',
                'End Date': '2017-04-13T04:53:56.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-07-10T06:53:00.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.1262037037
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-07-14T07:55:34.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.040775463
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-09-13T01:54:19.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 8.7460763889
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-07-28T09:27:21.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0433217593
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-07-12T11:32:21.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0831018519
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-04-13T04:01:47.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.008125
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-06-20T10:32:28.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0290509259
            },
            {
                'Owner': 'Anastasiya Karabitskaya',
                'End Date': '2017-06-01T06:33:52.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 9.9237847222
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-07-12T11:32:20.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.1345717593
            },
            {
                'Owner': 'Alexander Shutov',
                'End Date': '2017-04-13T04:27:43.000Z',
                'Project': 'Taucharts',
                'Cycle Time': 0.0104398148
            }
        ].map(function (d, i) {
            d.id = 'entity-' + i;
            return d;
        });
    }
})();
