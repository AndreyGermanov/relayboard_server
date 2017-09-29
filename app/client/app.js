import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Store from './store/Store';
Store.ddpConnect(function() {
    /*jshint ignore:start */
    ReactDOM.render(<App/>,document.getElementById('app'));
    /*jshint ignore:end */
});
