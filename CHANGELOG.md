## 2.5.0 (august 18, 2018)

- add new settings for legend plugin (onSelect handler and selectedCategories) [#545](https://github.com/TargetProcess/tauCharts/pull/545)

## 2.4.0 (august 15, 2018)

- add posibility set field bounds for quick filter [#543](https://github.com/TargetProcess/tauCharts/pull/543)

## 2.3.2 (june 25, 2018)

- fix diff tooltip [#534](https://github.com/TargetProcess/tauCharts/pull/534)

## 2.3.1 (june 18, 2018)

- improve multiple labels [#533](https://github.com/TargetProcess/tauCharts/pull/533)

## 2.3.0 (june 5, 2018)

- fix ticks positioning in case annotation adds new ticks [#532](https://github.com/TargetProcess/tauCharts/pull/532)
- allow override default tickFormatter [#532](https://github.com/TargetProcess/tauCharts/pull/532)

## 2.2.3 (may 16, 2018)

- fix tick position for vertical facet [#530](https://github.com/TargetProcess/tauCharts/pull/530)

## 2.2.2 (may 11, 2018)

## changed

- improve cutting facet label logic [#528](https://github.com/TargetProcess/tauCharts/pull/528)

## fixed

- order for dates in Color legend when scale is periodic [#528](https://github.com/TargetProcess/tauCharts/pull/528)


## 2.2.1 (may 4, 2018)

### changed

- multiline label improvements [#526](https://github.com/TargetProcess/tauCharts/pull/526)




## 2.2.0 (april 26, 2018)

### changed

- Added clickable entry to tooltip plugin settings ([@nayrrod](https://github.com/nayrrod) in [#523](https://github.com/TargetProcess/tauCharts/pull/523))
- Multiline labels support (using lineBreak and lineBreakSeparator flags for label guide [#525](https://github.com/TargetProcess/tauCharts/pull/525)

### fixed
- default TypeScript export definition to conform to version 2.6.0 rules
  ([@tyronedougherty](https://github.com/tyronedougherty) in [#520](https://github.com/TargetProcess/tauCharts/pull/520))

## 2.1.0 (march 21, 2018)

### changed

- place Y facets labels at top-left under facet cell
- place Y axis label at top, X axis label at right


## 2.0.3 (march 11, 2018)

### fixed

- animation when tooltip disappears

## 2.0.2 (february 28, 2018)

### fixed

- fix build bundle [#514](https://github.com/TargetProcess/tauCharts/pull/514)

## 2.0.1 (february 20, 2018)

### fixed

- trendline plugin applies only for chart element [#513](https://github.com/TargetProcess/tauCharts/pull/513)
- fixed generating data refs for trendline plugins [#513](https://github.com/TargetProcess/tauCharts/pull/513)

## 2.0.0 (january 31, 2018)

### Breaking Changes

- D3 v4 is now dependency.
- `Taucharts` global object name (was `tauCharts`).
- `.tau-chart__` CSS class prefix (was`.graphical-report__`).
- `export-to` plugin alias changed (was `exportTo`).
- Distributive files paths changed. `dist/taucharts.min.js` and `dist/taucharts.min.css` contain the core and all the plugins minified together. `dist/taucharts.js` and `dist/taucharts.css` contain unfinified core, JS and CSS for plugins can be found in `dist/plugins/` folder (e.g. to import a plugin you should do something like `import tooltip from 'taucharts/dist/plugins/tooltip';`).

[early release](https://github.com/TargetProcess/tauCharts/releases)