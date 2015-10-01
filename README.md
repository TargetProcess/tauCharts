Taucharts [![Build Status](https://travis-ci.org/TargetProcess/tauCharts.png?branch=master)](https://travis-ci.org/TargetProcess/tauCharts) [![Coverage Status](https://img.shields.io/coveralls/TargetProcess/tauCharts.svg)](https://coveralls.io/r/TargetProcess/tauCharts) [![Code Climate](https://codeclimate.com/github/TargetProcess/tauCharts/badges/gpa.svg)](https://codeclimate.com/github/TargetProcess/tauCharts)
=========

Taucharts is a [data-focused javascript charting library](http://blog.taucharts.com/taucharts-data-focused-charting-library/) based on D3. Designed with passion.

#####Official website: [www.taucharts.com](http://www.taucharts.com)
#####Documentation: [api.taucharts.com](http://api.taucharts.com)
#####Project blog: [blog.taucharts.com](http://blog.taucharts.com)

##Why use?
####Simplicity
Data plays a key role in Taucharts. The library provides declarative interface for the fast mapping of data fields to visual properties.
####Flexibility
The library's architecture allows to build [facets](http://api.taucharts.com/basic/facet.html) and extend chart behaviour with reusable plugins.
####Design
Taucharts team is passionate about beautiful design.
####...
Dive into the high-level [Taucharts concept](http://blog.taucharts.com/taucharts-data-focused-charting-library/) and [usage reviews](#taucharts-examples--usage-reviews).

##How to use?

####Using TauCharts with a CDN

Load javascript dependencies

```html
<script src="//cdn.jsdelivr.net/d3js/latest/d3.min.js" charset="utf-8"></script>
<script src="//cdn.jsdelivr.net/underscorejs/latest/underscore-min.js" type="text/javascript"></script>
<script src="//cdn.jsdelivr.net/taucharts/latest/tauCharts.min.js" type="text/javascript"></script>
```

Include CSS file as well

```html
<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/taucharts/latest/tauCharts.min.css">
```

####Downloading TauCharts using Bower

```bash
bower install taucharts
```

####Downloading TauCharts using npm

```bash
npm install taucharts
```
=========

Here are the popular usage scenarios. For more examples, see experimental [sample page](http://taucharts.com/taulab/index.html).

####Scatter plot
```javascript
var chart = new tauCharts.Chart({
    "type" : "scatterplot",
    "x"    : "eccentricity",
    "y"    : "period",
    "color": "name",
    "size" : "mass",
    "data" : [{"eccentricity": 0, "period": 4.95, "name": "exoplanet", "mass": 38.0952}, ...]
});
```
[![Scatterplot](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/scatter-plot.png)](http://api.taucharts.com/basic/scatterplot.html)

See [scatter plot documentation](http://api.taucharts.com/basic/scatterplot.html)

=========

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
[![Line Chart](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/line-chart.png)](http://api.taucharts.com/basic/line.html)

See [line chart documentation](http://api.taucharts.com/basic/line.html)

=========

####Bar chart
```javascript
var chart = new tauCharts.Chart({
    type : 'bar',
    x    : 'team',
    y    : 'effort',
    color:'priority',
    data : [{"team": "d", "cycleTime": 1, "effort": 1, "count": 1, "priority": "low"}, ...]
});
```
[![Bar Chart](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/bar-chart.png)](http://api.taucharts.com/basic/bar.html)

See [bar chart documentation](http://api.taucharts.com/basic/bar.html)

=========

####Horizontal bar chart
```javascript
var chart = new tauCharts.Chart({
    type : 'horizontal-bar',
    x    : 'count',
    y    : 'team',
    data : [{"team": "alpha", "count": 8}, ...]
});
```
[![Horizontal Bar Chart](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/horizontal-bar-chart.png)](http://api.taucharts.com/basic/horizontal-bar.html)

See [horizontal bar chart documentation](http://api.taucharts.com/basic/horizontal-bar.html)

=========

####Stacked bar chart
```javascript
var chart = new tauCharts.Chart({
    type : 'stacked-bar',
    x    : 'process',
    y    : 'count',
    color: 'stage',
    data : [{process: 'sales', stage: 'visit', count: 100}, ...]
});
```
[![Stacked Bar Chart](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/stacked-bar-chart.png)](http://api.taucharts.com/basic/stacked-bar.html)

See [stacked bar chart documentation](http://api.taucharts.com/basic/stacked-bar.html)

=========

####Horizontal stacked bar chart
```javascript
var chart = new tauCharts.Chart({
    type : 'horizontal-stacked-bar',
    y    : 'process',
    x    : 'count',
    color: 'stage',
    data : [{process: 'sales', stage: 'visit', count: 100}, ...]
});
```
[![Horizontal Stacked Bar Chart](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/horizontal-stacked-bar-chart.png)](http://api.taucharts.com/basic/horizontal-stacked-bar.html)

See [horizontal stacked bar chart documentation](http://api.taucharts.com/basic/horizontal-stacked-bar.html)

=========

####Facet chart
```javascript
var chart1 = new tauCharts.Chart({
  type : 'scatterplot',
  x    : ['milespergallon'],
  y    : ['class', 'price'],
  color: 'class',
  data : [{class: "C", milespergallon: 41.26, price: 24509.74, vehicle: "Prius1"}, ...]
});
```
[![Facet scatterplot chart](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/facet.png)](http://api.taucharts.com/basic/facet.html)

See [facet charts documentation](http://api.taucharts.com/basic/facet.html)

=========

####Data Streaming
```javascript
var chart1 = new tauCharts.Chart({
    type : 'bar',
    x    : ['x'],
    y    : ['type', 'y'],
    color: 'type',
    ...
});
```
[![Streaming Data Chart](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/data-streaming.png)](http://jsfiddle.net/4o4z6fqn/5/)
Sample uses [setData(..)] method to refresh chart data source.

See [streaming sample online](http://jsfiddle.net/4o4z6fqn/5/)

=========

####Complex Composable charts
[![Composable Chart](https://dl.dropboxusercontent.com/u/96767946/taucharts.com/complex-composable-chart.png)](http://jsfiddle.net/6LzefLo4/4/)

See [composable chart sample online](http://jsfiddle.net/6LzefLo4/4/)

=========

##Taucharts examples / usage reviews

[R Wrapper](http://www.buildingwidgets.com/blog/2015/8/5/week-31-taucharts)

[Taucharts Twitter channel](https://twitter.com/search?q=taucharts)

[Targetprocess Graphical Reports](https://www.targetprocess.com/blog/2015/09/prototype-for-new-custom-graphical-reports-editor/)

[Vizydrop project](http://vizydrop.com/)

[Taucharts samples](http://taucharts.com/taulab/index.html)

##License

Licensing: [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

Have a questions? [Contact us](mailto:michael@targetprocess.com)
