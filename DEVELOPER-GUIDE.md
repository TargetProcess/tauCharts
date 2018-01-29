# Taucharts Developer Guide

Welcome to the **Taucharts Developer Guide**.

This guide will walk you through Taucharts-specific terms
and show you how the library works to give you an idea
on how to improve it.

Many terms and ideas are covered in **The Grammar of Graphics** book by Leland Wilkinson.

### What happens when you create a chart instance?

```js
const chart = new Taucharts.Chart({
    type: 'line',
    x: 'Date',
    y: 'Effort',
    data: [...],
    guide: { x: { tickPeriod: 'month' } },
    settings: { asyncRendering: true }
});
```

- Simple chart config is auto-transformed into a more complex specification,
containing information about detected dimensions' types
and hierarchical structure of elements *(though it can be specified manually)*.
- Then GPL config is created *(Graphics Programming Language)*.
It contains information about data sources and scales configurations.
- Plugins are initialized.
Each plugin can add content into chart layout,
subscribe to chart events and modify the configuration at different steps of processing,
register new Grammar Elements etc.
- Same steps are run after calling `chart.updateConfig( config )`.

```
        .--------------.
        |    CONFIG    |
        |--------------|
        | {            |
        |   type,      |
        |   x, y,      |
        |   data,      |
        |   guide,     |
        |   settings,  |
        |   ...        |
        | }            |
        '-------|------'
                |
                |__________
                           |
                           |
.==========================|========================================.
|                          |                   src/charts/tau.chart |
|  new Taucharts.Chart( config )                                    |
:                 |                                                 :
.                 |___________  - - - subscribe to window 'resize'  .
                              |
                              |___________
                                          |
                                          |
    DataProcessor.autoDetectDimTypes( spec.data )
      DataProcessor.autoAssignScales( dimensions )
                              |
                              |
  chartTypesRegistry.get( spec.type )
                              |__________ ChartArea     src/api/...
                              |__________ ChartLine
                              |__________ ...
                              |
            transformConfig( config )
                              |
                  .-----------|------------------.
                  |            SPEC              |
                  |------------------------------|
                  | config.spec = {              |
                  |   dimensions,                |
                  |   unit: {                    |
                  |     type: 'COORDS.RECT',     |
                  |     x: [...],                |
                  |     y: [...],                |
                  |     unit: [ { x, y, ... } ], |
                  |     ...                      |
                  |   }                          |
                  | }                            |
                  '-----------|------------------'
                              |
                              |____________
                                           |
                                           |
 .=========================================|==========================.
 |                                         |      src/charts/tau.plot |
 |  new Taucharts.Plot( { spec, x, y, data, guide, settings, ... } )  |
 :                  |                                                 :
 .                  |_____________________                            .
                                          |
                                          |
                    Plot.setupSettings( config )
                  this.createGPLConfig( config )
                                          |
                                          | - - - this.setupPlugins()
                                          |
                  .=======================|=================.
                  |                       |          src/spec-converter
                  |  new SpecConverter( config ).convert()  |
                  :                                 |       :
                  .                  _______________|       .
                                    |
                      .-------------|---------------------.
                      |            GPL CONFIG             |
                      |-----------------------------------|
                      | {                                 |
                      |   sources: {                      |
                      |     '?': { dims: {}, data: [] },  |
                      |     '/': { dims: {}, data: [] }   |
                      |   },                              |
                      |   scales: {                       |
                      |     x_null: { type, source: '?' },|
                      |     y_null: { type, source: '?' },|
                      |     ...                           |
                      |   }                               |
                      | }                                 |
                      '-----------------------------------'
```

### Let's render the chart

```js
chart.renderTo( domElement );
```

- Chart layout is inserted into DOM element.
Chart size is determined by container's size *(if not specified)*.
- Live Spec (detailed GPL config) is created from GPL config by using Spec Transformers.
Default transformers are **ApplyRatio** (removes empty values from facets and resizes facets proportionally)
and **AutoLayout** (configures layout parameters depending on chart size).
- Units structure gets unfolded, data is passed from parents to their children and processed by applying expressions (filters etc.).
- Another Spec Transformers are applied:
**ExtractAxes** removes repeated X and Y axes from facets,
**CalcSize** calculates required chart size and hides ticks or labels when there is not enough space.
There are some strategies for calculating required size and optimizing a chart, the most common are
`normal` (default one, displays scrollbars when optimal chart size is too large to prevent large density
of facets, categorical ticks, bars etc.)
and `entire-view` (fits the whole chart into specified size without displaying scrollbars).
- Task Runner is initialized. It runs tasks asynchronously by small synchronous chunks
to prevent browser from freeze.
- Tasks for creating draw scenario are scheduled.
Grammar Elements are created, their screen models are initialized and modified by Grammar Rules, that are toggled by guides.
- Tasks for rendering DOM nodes are scheduled.
The `draw` method of each Grammar Element is called and chart DOM nodes are created or updated one by one.
- Task runner executes scheduled tasks.
- Same steps are repeated when `chart.refresh()` or `chart.updateConfig( config )` is called.
The best practice is to reuse existing DOM nodes and slightly animate their transition.

```
  .=========================================================.
  | Plot                               src/charts/tau.plot  |
  |                 this.disablePointerEvents()             |
  :                 this._insertLayout()                    :
  .                 this._createLiveSpec()                  .
                            |
                     .------|-----.
                     | GPL CONFIG |
                     |------------|
                     | {          |
                     |   sources, |
                     |   scales,  |
                     | }          |
                     '------|-----'
                            |___________
                                        |
            SpecTransformApplyRatio( liveSpec )
            SpecTransformAutoLayout( liveSpec )
                            |
                            | - - - - `specready`
                      .-----|-----.
                      | LIVE SPEC |
                      |-----------|
                      | {         |
                      |   sources,|
                      |   scales, |
                      | }         |
                      '-----|-----'
                            |
                            |__________
                                       |
                                       |
                   this._createGPL( liveSpec )
                            |
            .===============|===================.
            |               |        src/charts/tau.gpl
            |   new GPL( liveSpec )             |
            :       .unfoldStructure()          :
            .              |                    .
                           |
                     .-----|-----.
                     | LIVE SPEC |
                     | (expanded)|
                     |-----------|
                     | {         |
                     |   sources,|
                     |   scales, |
                     | }         |
                     '-----|-----'
                           |
                           |_____________
                                         |
                                         |
            SpecTransformExtractAxes( liveSpec )
             SpecTransformCalcSize( liveSpec )
                           |
                           | - - - - `unitsstructureexpanded`
                     .-----|-----.
                     | LIVE SPEC |
                     |  (final)  |
                     |-----------|
                     | {         |
                     |   sources,|
                     |   scales, |
                     | }         |
                     '-----|-----'
                           |
                           |___________
                                       |
                                       |
        this._scheduleDrawScenario( liveSpec ) - - - (async via TaskRunner)
                           |
                           |
               gpl.getDrawScenarioQueue()
                           |
                           |
                 .---------|--------.
                 | GRAMMAR ELEMENTS |
                 |------------------|
                 | [                |
                 |   {screenModel}, |
                 |   {screenModel}  |
                 |   ...            |
                 | ]                |
                 '---------|--------'
                           |
                           |
              this._scheduleDrawing() - - - (async via TaskRunner)
                           |
                           | - - - `beforerender`
                           |
                    grammarElement.draw() - - - `unitdraw`
                    grammarElement.draw() - - - `unitdraw`
                          ...
                           |
                           | - - - `render`

                TaskRunner.run()
                            |
                       _____|
                      |
                      |
            |              __
         20 |     __/\  __/
            |  __/    \/
          0 |__________________
              Jan   May   Sep
```

### Publishing the library.
- Assign a version number using Semantic Versioning rules. If API or some features are not stable, use `-beta.0` prefix.
- Ensure that all tests are passed successfully.
- Publish a beta version by executing `npm publish --tag beta`.
- Publish a stable version by executing `npm publish`.
