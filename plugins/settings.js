import Taucharts from 'taucharts';

    var utils = Taucharts.api.utils;

    function ChartSettings(xSettings) {

        var pluginSettings = utils.defaults(
            xSettings || {},
            {
                show: true,
                modes: [
                    'normal',
                    'entire-view',
                    'fit-width',
                    'fit-height',
                    'minimal'
                ]
            });

        return {

            init: function (chart) {

                if (pluginSettings.show) {

                    pluginSettings.selectedMode = chart.getSpec().settings.fitModel;

                    var panel = chart.insertToHeader(this.template(
                        {
                            modes: pluginSettings.modes.map(function (x) {
                                var selected = (pluginSettings.selectedMode === x) ? 'selected' : '';
                                return '<option ' + selected + ' value="' + x + '">' + x + '</option>';
                            })
                        }
                    ));

                    panel.addEventListener(
                        'change',
                        function (e) {
                            var target = e.target;
                            if (target.classList.contains('i-role-fit-model')) {
                                pluginSettings.selectedMode = target.value;
                                chart.getSpec().settings.fitModel = pluginSettings.selectedMode;
                                chart.refresh();
                            }
                        },
                        false);
                }
            },

            template: utils.template(
                [
                    '<div class="tau-chart__chartsettingspanel">',
                    '    <div>',
                    '        <span>View Mode:&nbsp;</span>',
                    '        <select class="i-role-fit-model tau-chart__select">',
                    '        <%= modes %> />',
                    '        </select>',
                    '    </div>',
                    '</div>'
                ].join(''))
        };
    }

    Taucharts.api.plugins.add('settings', ChartSettings);

export default ChartSettings;
