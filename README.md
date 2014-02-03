tauCharts [![Build Status](https://travis-ci.org/gruntjs/grunt-contrib-qunit.png?branch=master)](https://travis-ci.org/TargetProcess/tauCharts)
=========
[Live prototype](http://rawgithub.com/TargetProcess/tauCharts/master/prototype/index.html)

How it looks right now

![ScreenShot](http://www.taucharts.com/images/charts.png)

Usage

```javascript
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
