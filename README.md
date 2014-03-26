tauCharts [![Build Status](https://travis-ci.org/TargetProcess/tauCharts.png?branch=master)](https://travis-ci.org/TargetProcess/tauCharts)
=========

Dev: 

Use grunt to build everything. Maybe 'bower install' is required

[Live prototype](http://rawgithub.com/TargetProcess/tauCharts/master/prototype/index.html)

How it looks right now

![ScreenShot](http://www.taucharts.com/images/charts.png)

Usage (line chart and scatterplot chart)

```javascript

var lineData = [
    {
        "priority": "High",
        "effort": 1,
        "bugsCount": 2
    },
    {
        "priority": "High",
        "effort": 2,
        "bugsCount": 2
    }];

var scatterData = [
    {
        "duration": 20,
        "effort": 10,
        "timeSpent": 14,
        "priority": "High"
    },
    {
        "duration": 29,
        "effort": 23,
        "timeSpent": 13,
        "priority": "Low"
    }];

 tau.charts
        .Scatterplot(scatterplotData)
        .map({
            x: tau.data.map('duration').linear(),
            y: tau.data.map('timeSpent').caption("TimeSpent").linear(),
            size: 'effort',
            color: tau.data.map('priority').category10()
        })
        .plugins(
            tau.plugins.legend(), 
            tau.plugins.tooltip('effort', 'priority'),
            tau.plugins.highlighter(),
            tau.plugins.projection()
        )
        .render("#chartScatter");

tau.charts
        .Line(lineData)
        .map({
            x: tau.data.map('effort').linear(),
            y: tau.data.map('bugsCount').linear(),
            color: tau.data.map('priority').category10()
        })
        .plugins(
            tau.plugins.legend(), 
            tau.plugins.tooltip('priority', 'effort', 'bugsCount'),
            tau.plugins.highlighter(),
            tau.plugins.projection()
        )
        .render("#chartLine");
```
