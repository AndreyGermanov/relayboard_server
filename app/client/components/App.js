import React,{Component} from "react";
import { Route } from 'react-router';
import { HashRouter,Link } from 'react-router-dom';
import Settings from '../containers/SettingsContainer';
import Dashboard from '../containers/DashboardContainer';
import {Provider} from 'react-redux';
import Store from '../store/Store';
var App = class extends Component {
    render() {
        return (
            <Provider store={Store.store}>
                <HashRouter>
                <main>
                    <aside className="al-sidebar">
                        <ul className="al-sidebar-list">
                            <li className="al-sidebar-list-item">
                                <Link className="al-sidebar-list-link" to={{pathname:'/'}}>
                                    <i className="fa fa-home"></i>
                                    <span>Dashboard</span>
                                </Link>
                                <Link className="al-sidebar-list-link" to={{pathname:'/settings'}}>
                                    <i className="fa fa-cog"></i>
                                    <span>Setup</span>
                                </Link>
                            </li>
                        </ul>
                    </aside>
                    <div className="al-main">
                        <div className="al-content">
                                <div>
                                    <Route exact path="/" component={Dashboard}/>
                                    <Route exact path="/settings" component={Settings}/>
                                </div>
                        </div>
                    </div>
                    <footer className="al-footer clearfix">
                    </footer>
                </main>
                </HashRouter>
            </Provider>
        )
    }
}

export default App;