##Custom colors for encoding color value
You can set custom colors for encoding color value or use bundles some fantastic categorical color scales by [Cynthia Brewer](http://colorbrewer2.org/).
If you want use colorbrewer, you should include following code in your pages
```HTML
 <link href="path_to_tauCharts/css/colorbrewer.css" rel="stylesheet"/>
 <script src="path_to_tauCharts/src/addons/color-brewer.js"></script>
```
and for define color should use
```javascript
var spec = {
  unit:[{
       type: 'ELEMENT.INTERVAL',
       x: 'month',
       y: 'count',
       color: {dimension:'team', brewer:tauBrewer(YlGnBu,9)}
   }]
};
```
if you want use custom bandles you can define following method
```javascript
var spec = {
  unit:[{
       type: 'ELEMENT.INTERVAL',
       x: 'month',
       y: 'count',
       color: {dimension:'team', brewer:['myColorCssClass1','myColorCssClass2','myColorCssClass3']}
   }]
};
```
or if you want have mapping from your domain
```javascript
var spec = {
  unit:[{
       type: 'ELEMENT.INTERVAL',
       x: 'month',
       y: 'count',
       color: {dimension:'team', brewer:{
        NewTeam:'myColorCssClass1',
        Alaska:'myColorCssClass2',
        oldTeam:'myColorCssClass3'
       }
       }
   }]
};
```
