import {createStore,applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import RootReducer from '../reducers/RootReducer';

const Store = class {
    constructor() {
        this.store = createStore(RootReducer,applyMiddleware(thunkMiddleware));
    }
}

export default new Store();