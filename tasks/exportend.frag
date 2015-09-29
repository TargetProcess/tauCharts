 define('tauCharts',function(){
   return tauCharts;
 });
 require.config({
    paths:{
        'canvgModule': '../bower_components/canvg/canvg'
    },
    map:{
        '*':{
             'FileSaver':'../bower_components/FileSaver.js/FileSaver',
             'rgbcolor': '../bower_components/canvg/rgbcolor',
             'stackblur': '../bower_components/canvg/StackBlur',
             'fetch':'../bower_components/fetch/fetch',
             'promise':'../bower_components/es6-promise/promise',
             'print.style.css': '../node_modules/requirejs-text/text!print.style.css'
        }
    }
 })

 return  require('export');
}));