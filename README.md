TauCharts [![Build Status](https://travis-ci.org/TargetProcess/tauCharts.png?branch=master)](https://travis-ci.org/TargetProcess/tauCharts) [![Coverage Status](https://img.shields.io/coveralls/TargetProcess/tauCharts.svg)](https://coveralls.io/r/TargetProcess/tauCharts) [![Code Climate](https://codeclimate.com/github/TargetProcess/tauCharts/badges/gpa.svg)](https://codeclimate.com/github/TargetProcess/tauCharts)
=========

TauCharts is a Javascript charting library based on D3. Designed with passion.

Official website: [www.taucharts.com](http://www.taucharts.com)

=========

#Documentation

Read the documentation here. There are some tutorials, basic and advanced topics.

http://api.taucharts.com/

#Usage

##Scatter plot

```javascript
var chart1 = new tauCharts.Chart({
  type: 'scatterplot',
  x: 'milespergallon',
  y: 'price',

  data: [
    {class: "C", milespergallon: 41.26, price: 24509.74, vehicle: "Prius (1st Gen)", year: 1997},
    ...
    {class: "C", milespergallon: 37   , price: 39145   , vehicle: "Chevrolet Volt" , year: 2013}
  ],

  plugins: [
    tauCharts.api.plugins.get('trendline')()
  ]
});
chart1.renderTo('#target');
```
![Scatterplot](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/scatterplot.png)

##Simple horizontal bar chart

```javascript
var chart1 = new tauCharts.Chart({
  type: 'horizontal-bar',
  y: 'vehicle',
  x: 'price',
  data: [
    {price: 84000 , vehicle: "ActiveHybrid 7L"},
    ...
    {price: 118000, vehicle: "Lexus LS600h/hL"}
  ]
});
chart1.renderTo('#target');
```
![Horizontal BarChart](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/horizontal-bar.png)

##Facets

```javascript
var chart1 = new tauCharts.Chart({
  type: 'scatterplot',
  x: ['milespergallon'],
  y: ['class', 'price'],
  color: 'class',

  data: [
    {class: "C", milespergallon: 41.26, price: 24509.74, vehicle: "Prius (1st Gen)", year: 1997},
    ...
    {class: "C", milespergallon: 37   , price: 39145   , vehicle: "Chevrolet Volt" , year: 2013}
  ],

  plugins: [
    tauCharts.api.plugins.get('legend')(),
    tauCharts.api.plugins.get('trendline')()
  ]
});
chart1.renderTo('#target');
```
![Facet](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/facet.png)

#License

Licensing: [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

Have a questions? [Contact us](mailto:michael@targetprocess.com)

#Change Log
## [0.4.5] - 2015-06-13
### Added
- fix flex scales


## [0.4.4] - 2015-06-11
### Added
- fix legend plugin for stacked bar charts
- add support [parallel coordinates](http://en.wikipedia.org/wiki/Parallel_coordinates) 

## [0.4.3] - 2015-05-18
### Added
- stacked bar charts


## [0.4.2] - 2015-04-30
### Added
- geo charts (alpha)


## [0.4.1] - 2015-04-22
### Added
- Flex scales (ratio parameter for ordinal scales)
- Auto calculate ratio for 2-level facet
- "Settings" plugin. Allow to control fit to view-port


## [0.4.0] - 2015-04-17
### Added
- New core (extended GPL syntax)
- Adapter for compatibility with previous definitions (except guide.split parameter)


