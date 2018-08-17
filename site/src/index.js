import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Editor from './Editor';
import {datasets} from './datasets';
import {configs} from './configs';
import registerServiceWorker from './registerServiceWorker';
import './blog';
import './main'

ReactDOM.render(<Editor configs={configs} datasets={datasets} />, document.getElementById('editor'));
registerServiceWorker();
