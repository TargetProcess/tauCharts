Taucharts [![Build Status](https://travis-ci.org/TargetProcess/tauCharts.png?branch=master)](https://travis-ci.org/TargetProcess/tauCharts) [![Coverage Status](https://img.shields.io/coveralls/TargetProcess/tauCharts.svg)](https://coveralls.io/r/TargetProcess/tauCharts) [![Code Climate](https://codeclimate.com/github/TargetProcess/tauCharts/badges/gpa.svg)](https://codeclimate.com/github/TargetProcess/tauCharts)
=========

Taucharts is a [data-focused javascript charting library](http://blog.taucharts.com/taucharts-data-focused-charting-library/) based on D3. Designed with passion.

#####Official website: [www.taucharts.com](http://www.taucharts.com)
#####Documentation: [api.taucharts.com](http://api.taucharts.com)
#####Project blog: [blog.taucharts.com](http://blog.taucharts.com)

##Why to use?
####Simplicity
Data plays a key role in Taucharts. The library provides declarative interface for fast mapping of data fields to visual properties.
####Flexibility
The library's architecture allows to build [facets](http://api.taucharts.com/basic/facet.html) and extend chart behaviour with reusable plugins.
####Design
Taucharts team is passionate about beautiful design.
####...
Dive into high-level [Taucharts concept](http://blog.taucharts.com/taucharts-data-focused-charting-library/) and usage reviews.

##How to use?

Here are the popular usage scenarios. See also experimental [sample page](http://taucharts.com/taulab/index.html).

####Scatter plot
```javascript
var chart = new tauCharts.Chart({
    "type": "scatterplot",
    "x": "eccentricity",
    "y": "period",
    "color": "name",
    "size": "mass",
    "data": [{"eccentricity": 0, "period": 4.95, "jupiter mass": 0.12, "name": "exoplanet", "mass": 38.0952}, ...]
});
```
![Scatterplot](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/scatter-plot.png)
http://api.taucharts.com/basic/scatterplot.html

####Line chart
```javascript
var chart = new tauCharts.Chart({
    "type" : "line",
    "y"    : "SUM(Total Medals)",
    "x"    : "Age",
    "color": "Sport",
    "data" : [{ "Sport": "Swimming", "Age": 23, "SUM(Total Medals)": 72 }, ...]
});
```
![Line Chart](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/line-chart.png)
http://api.taucharts.com/basic/line.html

####Bar chart
```javascript
var chart = new tauCharts.Chart({
    type : 'bar',
    x    : 'team',
    y    : 'effort',
    color:'priority',
    data : data
});
```
http://api.taucharts.com/basic/bar.html

####Horizontal bar chart
```javascript
var chart = new tauCharts.Chart({
    type : 'horizontalBar',
    x    : 'effort',
    y    : 'team',
    color:'priority',
    data : data
});
```
http://api.taucharts.com/basic/horizontal-bar.html

####Stacked bar chart
```javascript
var chart = new tauCharts.Chart({
    type : 'stacked-bar',
    x    : 'process',
    y    : 'count',
    color: 'stage',
    data : data
});
```
http://api.taucharts.com/basic/stacked-bar.html

####Horizontal stacked bar chart
```javascript
var chart = new tauCharts.Chart({
    type : 'horizontal-stacked-bar',
    y    : 'process',
    x    : 'count',
    color: 'stage',
    data : data
});
```
http://api.taucharts.com/basic/horizontal-stacked-bar.html

####Facet chart
####Composable chart
####Data Streaming

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

##Who use Taucharts?
http://www.buildingwidgets.com/blog/2015/8/5/week-31-taucharts

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


