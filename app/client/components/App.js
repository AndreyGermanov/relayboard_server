import React,{Component} from "react";
import { Router, Route } from 'react-router';
import { Link } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import Settings from './Settings';
import Dashboard from './Dashboard';

var App = class extends Component {
    render() {
        const browserHistory = createBrowserHistory();
        return (
            <div>
                <Router history={browserHistory}>
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
                </Router>
            </div>
        )
    }
}

export default App;