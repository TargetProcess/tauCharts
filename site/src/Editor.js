import React from 'react';
import createClass from 'create-react-class'
import tauCharts from 'taucharts';
import 'taucharts/build/development/plugins/tauCharts.tooltip';
import 'taucharts/build/development/plugins/tauCharts.legend';
import 'taucharts/build/development/plugins/tauCharts.quick-filter';
import 'taucharts/build/development/plugins/tauCharts.trendline';
import 'taucharts/build/production/tauCharts.min.css';
import _ from 'underscore';
import './Editor.css';

const chartTypes = ['scatterplot', 'line', 'area', 'bar', 'horizontal-bar', 'stacked-bar', 'horizontal-stacked-bar'];
const pluginsList = ['tooltip', 'legend', 'quick-filter', 'trendline'];

const toggleArray = function (array, value) {
    const index = array.indexOf(value);
    (index === -1) ? array.push(value) : array.splice(index, 1);
    return array;
};

const randomFromArray = function (array) {
    return array[Math.floor((Math.random() * (array.length)))];
};

const Editor = createClass({
    getInitialState: function () {
        return {config: this.getConfigByNumber(0)};
    },
    getConfigByNumber: function (n) {
        return _.clone(this.props.configs[n]);
    },
    render: function () {
        return (
            <div>
                <div className="editor right-panel">
                    <div className="editor-wrapper">
                        <div className="controls">
                            <div className="controls-place">
                                <NavButtons updateConfig={this.updateConfig} randomConfig={this.getRandomConfig}
                                            getConfigByNumber={this.getConfigByNumber} maxConfig={this.props.configs.length} />
                            </div>
                            <span className="play-tip">Play with me ;) </span>
                        </div>
                        <div className="code" id="code">
                            <ChartConfig config={this.state.config} datasets={this.props.datasets}
                                         replaceDataset={this.replaceDataset} updateConfig={this.updateConfig}/>
                        </div>
                    </div>
                </div>
                <div className="description">
                    <div className="content-side">
                        <p>
                          <span className="head">
                              {this.state.config.description[0]}
                          </span>
                            <b>
                                {this.state.config.description[1]}
                            </b>
                        </p>
                    </div>
                </div>
                <div className="example-box">
                    <div className="data-chart" id="data-chart">
                        <section className="editor">
                            <div className="error" id="error"/>
                            <div className="chart" id="chart"/>
                        </section>
                    </div>
                </div>
            </div>
        )
    },
    renderChart: function () {
        try {
            this.chart = new tauCharts.Chart(this.prepareConfig(this.state.config));
            this.chart.renderTo('#chart');
        } catch (err) {
            console.log(err);
            document.getElementById('error').classList.add('show');
            document.getElementById('error').innerHTML = err;
        }
    },
    componentDidMount: function () {
        this.renderChart();
    },
    componentDidUpdate: function () {
        this.chart.destroy();
        document.getElementById('chart').innerHTML = '';
        document.getElementById('error').innerHTML = '';
        document.getElementById('error').classList.remove('show');

        this.renderChart();
    },
    prepareConfig: function (config) {

        var clone = _.clone(config);
        clone.data = this.props.datasets[config.data];
        //clone.guide = {interpolate: 'cardinal'};

        clone.plugins = config.plugins.map(function (field) {
            return tauCharts.api.plugins.get(field)();
        });

        return clone;
    },
    findConfig: function (name) {
        return _.find(this.props.configs, function (config) {
            return config.data === name;
        })
    },
    replaceDataset: function (newDataset) {
        var config = _.clone(this.findConfig(newDataset));
        this.setState({
            config: config
        });
    },
    updateConfig: function (changes) {
        var config = this.state.config;

        if (config['x'] === changes['y']) {
            config['x'] = config['y'];
        }

        if (config['y'] === changes['x']) {
            config['y'] = config['x'];
        }

        for (var attr in changes) {
            config[attr] = changes[attr];
            //intersection to save plugins order
        }

        this.setState({
            config: config
        });
    },
    getRandomConfig: function () {
        //In fact, not so random

        var config = {};
        var data = config.data = this.state.config.data;
        const datasets = this.props.datasets;
        var keys = {
            OscarNominees: _.keys(datasets['OscarNominees'][0]),
            Comets: _.keys(datasets['Comets'][0]),
            WorldBank: _.keys(datasets['WorldBank'][0]),
            EnglishPremierLeague: _.keys(datasets['EnglishPremierLeague'][0])
        };

        var categorical = {
            OscarNominees: ['isWinner', 'Rated', 'Genre', 'Language', 'Country', 'Production'],
            Comets: ['PHA', 'Orbit Class'],
            WorldBank: ['Country Name', 'Country Code', 'Income Group', 'Region'],
            EnglishPremierLeague: ['Club', 'Position', 'Season']
        };

        var facets = {
            OscarNominees: ['isWinner', 'Rated', 'Genre', 'Language', 'Country', 'Production'],
            Comets: ['PHA', 'Orbit Class'],
            WorldBank: ['Income Group', 'Region'],
            EnglishPremierLeague: ['Club', 'Season']
        };

        var dates = {
            OscarNominees: ['Released', 'Year', 'DVD'],
            Comets: ['Discovery Date'],
            WorldBank: null,
            EnglishPremierLeague: ['Year']
        };

        var ids = {
            OscarNominees: ['url', 'Title', 'Director', 'Writer', 'Actors', 'Plot', 'imdbID'],
            Comets: ['Designation'],
            WorldBank: ['Country Name', 'Country Code'],
            EnglishPremierLeague: null
        };

        var measures = {
            OscarNominees: _.difference(keys['OscarNominees'], _.union(categorical['OscarNominees'], dates['OscarNominees'], ids['OscarNominees'])),
            Comets: _.difference(keys['Comets'], _.union(categorical['Comets'], dates['Comets'], ids['Comets'])),
            WorldBank: _.difference(keys['WorldBank'], _.union(categorical['WorldBank'], dates['WorldBank'], ids['WorldBank'])),
            EnglishPremierLeague: _.difference(keys['EnglishPremierLeague'], _.union(categorical['EnglishPremierLeague'], dates['EnglishPremierLeague'], ids['EnglishPremierLeague']))
        };

        var chartTypes = _.chain({
            'scatterplot': 21,
            'line': (data !== 'WorldBank') ? 2 : 0,
            'area': (data !== 'WorldBank') ? 1 : 0,
            'bar': (data !== 'EnglishPremierLeague') ? 2 : 0,
            'horizontal-bar': (data !== 'EnglishPremierLeague') ? 2 : 0,
            'stacked-bar': 3,
            'horizontal-stacked-bar': 3
        }).map(function (value, key) {
            return _.range(value).map(function () {
                return key
            });
        }).flatten().value();

        var facetProb = 0.8;
        var sizeProb = 0.5;

        var pluginsList = ['tooltip', 'legend'];

        config.type = randomFromArray(chartTypes);

        switch (config.type) {
            case 'horizontal-bar' : //?
                config.x = randomFromArray(measures[data]);
                config.y = randomFromArray(ids[data]);

                config.x = (Math.random() > facetProb) ? [randomFromArray(facets[data]), config.x] : config.x;

                config.color = randomFromArray(categorical[data]);
                config.size = null;

                config.description = ['Horizontal bars ' + config.x + ' vs ' + config.y, 'Does it make sense?'];

                break;
            case 'bar' : //?
                config.x = randomFromArray(ids[data]);
                config.y = randomFromArray(measures[data]);

                config.y = (Math.random() > facetProb) ? [randomFromArray(facets[data]), config.y] : config.y;

                config.color = randomFromArray(categorical[data]);
                config.size = null;

                config.description = ['Bars ' + config.x + ' vs ' + config.y, 'Does it make sense?'];
                break;
            case 'horizontal-stacked-bar' :
                config.x = randomFromArray(measures[data]);
                config.y = randomFromArray(categorical[data]);

                config.x = (Math.random() > facetProb) ? [randomFromArray(facets[data]), config.x] : config.x;

                config.color = randomFromArray(categorical[data]);
                config.size = null;

                config.description = ['Horizontal stacked bars ' + config.x + ' vs ' + config.y, 'Does it make sense?'];
                break;
            case 'stacked-bar' :
                config.x = randomFromArray(categorical[data]);
                config.y = randomFromArray(measures[data]);

                config.y = (Math.random() > facetProb) ? [randomFromArray(facets[data]), config.y] : config.y;

                config.color = randomFromArray(categorical[data]);
                config.size = null;

                config.description = ['Stacked bars ' + config.x + ' vs ' + config.y, 'Does it make sense?'];
                break;
            case 'area' :
                config.x = randomFromArray(dates[data]);
                config.y = randomFromArray(measures[data]);

                config.y = (Math.random() > facetProb) ? [randomFromArray(facets[data]), config.y] : config.y;

                config.color = null;
                config.size = null;

                config.description = ['Area chart ' + config.x + ' vs ' + config.y, 'Does it make sense?'];
                break;
            case 'line' :
                config.x = randomFromArray(dates[data]);
                config.y = randomFromArray(measures[data]);

                config.y = (Math.random() > facetProb) ? [randomFromArray(facets[data]), config.y] : config.y;

                config.color = randomFromArray(categorical[data]);
                config.size = null;

                config.description = ['Line chart ' + config.x + ' vs ' + config.y, 'Does it make sense?'];
                break;
            case 'scatterplot' :
                config.x = randomFromArray(_.union(measures[data], dates[data]));
                config.y = randomFromArray(measures[data]);

                config.x = (Math.random() > facetProb) ? [randomFromArray(facets[data]), config.x] : config.x;
                config.y = (Math.random() > facetProb) ? [randomFromArray(facets[data]), config.y] : config.y;

                config.color = randomFromArray(categorical[data]);
                config.size = (Math.random() > sizeProb) ? randomFromArray(measures[data]) : null;

                config.description = ['Scatterplot ' + config.x + ' vs ' + config.y, 'Does it make sense?'];
                break;
        }

        config.plugins = pluginsList;

        return config

    }
});

var SelectPropertyLink = createClass({
    render: function () {

        var value = (_.isNull(this.props.value) && 'null') || this.props.value;
        var apost = ((this.props.type === 'string' || this.props.type === 'array') && this.props.name !== 'data') ? ['\'', '\''] : ['', ''];

        return (
            <span><a
                href="javascript: void 0">{apost[0]}{value}{apost[1]}</a>{(this.props.isNotLast) ? ', ' : null}</span>
        )
    }
});

var DropDownMenu = createClass({

    getInitialState: function () {
        return {
            checked: this.getValue()
        }
    },

    getValue: function () {
        return (!_.isArray(this.props.value)) ? [this.props.value] : this.props.value;
    },

    render: function () {

        var name = this.props.name;
        var options = this.props.options;
        var maxChecked = this.props.maxChecked;
        var self = this;

        var list = options.map(function (item, i) {
            var isChecked = (self.state.checked.indexOf(item) > -1) ? 'checked' : null;
            return (
                <li key={i} className={isChecked}>
                    <a href="javascript: void 0" onClick={self.handleClick} data-name={name} data-value={item}
                       data-maxchecked="1">{item}</a>
                    {(maxChecked > 1 && !isChecked) ?
                        <a href="javascript: void 0" onClick={self.handleClick} data-name={name} data-value={item}
                           data-maxchecked={maxChecked} className="add">&nbsp;</a> : null}
                </li>
            )
        });

        return (
            <ul className="menu">
                {list}
            </ul>
        )
    },
    handleClick: function (event) {

        var checked = this.state.checked;
        var minChecked = this.props.minChecked;
        var maxChecked = event.target.dataset.maxchecked;
        var value = event.target.dataset.value;
        var name = event.target.dataset.name;

        this.setState({checked: toggleArray(checked, value)});

        var result = (checked.length > maxChecked) ? checked.splice(checked.length - maxChecked, checked.length - 1) : checked;

        if (result.length >= minChecked) {

            var changes = {};
            switch (result.length) {
                case 1:
                    changes[name] = result[0];
                    break;
                case 0:
                    changes[name] = null;
                    break;
                default:
                    changes[name] = result;
            }

            (name === 'data') ? this.props.replaceDataset(value) : this.props.updateConfig(changes);

        }
    }
});

var PropertyLine = createClass({

    render: function () {

        var value = this.props.value;
        var name = this.props.name;
        var datasets = _.keys(this.props.datasets);

        var type = (_.isArray(value) && 'array') || (_.isString(value) && 'string') || (_.isNull(value) && 'null');
        var options = ((name === 'type') && chartTypes) || ((name === 'data') && datasets) || this.props.options;
        var menu = (this.props.menuItem === name);

        var links = (<SelectPropertyLink value={value} type={type} name={name}/>);

        if (type === 'array') {
            links = value.map(function (link, i) {

                var isNotLast = !(i === value.length - 1)
                return (
                    <SelectPropertyLink key={i} value={link} type={type} name={name} isNotLast={isNotLast}/>
                )
            });
            links.unshift('[');
            links.push(']');
        }

        if (name === 'plugins') {
            return (
                <dl className={name}>
                    <dt>{name}:</dt>
                    <dd className={type}><PluginsBlock value={value} options={options}
                                                       updateConfig={this.props.updateConfig}/></dd>
                </dl>
            )
        }

        return (
            <dl className={name}>
                <dt>{name}:</dt>
                <dd className={type} onClick={this.handleClick}>{(menu) ?
                    (<div>
                        <div className="fullscreen"></div>
                        <DropDownMenu value={value} options={options} name={name}
                                      maxChecked={(name === 'x' || name === 'y') ? 2 : 1}
                                      minChecked={(name === 'size' || name === 'color') ? 0 : 1}
                                      replaceDataset={this.props.replaceDataset} updateConfig={this.props.updateConfig}
                        /></div>) : null}{links}</dd>
                ,
            </dl>

        );
    },
    handleClick: function () {
        (this.props.menuItem === this.props.name) ? this.props.updateState(null) : this.props.updateState(this.props.name);
    }
});

var PluginLine = createClass({
    render: function () {

        var name = this.props.name;
        var isEnabled = this.props.isEnabled ? null : 'disabled';

        return (
            <li className={isEnabled} onClick={this.handleClick}>tauCharts.api.plugins.get(<a href="javascript: void 0">'{name}'</a>)(),
            </li>
        )
    },
    handleClick: function () {
        var changes = {};
        changes.plugins = toggleArray(this.props.activePlugins, this.props.name);

        this.props.updateConfig(changes);
    }
});

const PluginsBlock = createClass({
    render: function () {

        var value = this.props.value;
        var self = this;
        var plugins = pluginsList.map(function (plugin, i) {

            var isEnabled = (value.indexOf(plugin) > -1);

            return (
                <PluginLine key={i} name={plugin} isEnabled={isEnabled} updateConfig={self.props.updateConfig}
                            activePlugins={self.props.value}/>
            );
        });

        return (
            <div>
                <p>[</p>
                <ul>
                    {plugins}
                </ul>
                <p>]</p>
            </div>
        );

    }
});

const ChartConfig = createClass({

    getInitialState: function () {
        return {
            menuItem: null
        }
    },
    render: function () {
        var config = this.props.config;
        var datasets = this.props.datasets;

        var options = Object.keys(datasets[config.data][0]).map(function (option) {
            return option
        });
        var self = this;

        var fields = _.filter(_.keys(config), function (key) {
            return !_.isFunction(config[key]) && key !== 'description'
        }).map(function (field, i) {

            return (
                <PropertyLine key={i} name={field} value={config[field]} options={options} datasets={datasets}
                              menuItem={self.state.menuItem} updateState={self.updateState}
                              replaceDataset={self.props.replaceDataset} updateConfig={self.props.updateConfig}/>
            )
        });

        return (
            <div>
                <p><em>var</em> chart <em>= new</em> tauCharts.Chart(&#123;</p>
                {fields}
                <p>&#125;);</p>
                <p>chart.renderTo(<em>'#container'</em>);</p>
            </div>
        )
    },
    updateState: function (menuItem) {
        this.setState({
            menuItem: menuItem
        });
    }
});

const NavButtons = createClass({
    getInitialState: function () {
        return {configNumber: 0}
    },
    render: function () {
        return (
            <div className="navigator">
                <button className="prev-chart" href="javascript: void 0" onClick={this.prevChartClick}
                        disabled={this.state.configNumber <= 0}>&nbsp;</button>
                <button className="next-chart" href="javascript: void 0" onClick={this.nextChartClick}
                        disabled={this.state.configNumber >= (this.props.maxConfig - 1)}><span>Next example</span></button>
                <button className="lucky-chart" href="javascript: void 0" onClick={this.luckyClick}>&nbsp;</button>

            </div>
        )
    },
    nextChartClick: function () {
        this.state.configNumber++;
        this.props.updateConfig(this.props.getConfigByNumber(this.state.configNumber));
    },
    prevChartClick: function () {
        this.state.configNumber--;
        this.props.updateConfig(this.props.getConfigByNumber(this.state.configNumber));
    },
    luckyClick: function () {
        this.props.updateConfig(this.props.randomConfig());
    }
});


export default Editor;
