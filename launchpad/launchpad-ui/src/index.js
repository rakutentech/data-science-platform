import React, {lazy, Suspense} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import {applyMiddleware, compose, createStore} from 'redux'
import combineReducer from './launchpad/redux/reducers'
import {Provider} from 'react-redux'
import LoadingPage from './launchpad/components/LoadingPage'
// External CSS import
import 'bootstrap/dist/css/bootstrap.css'
import 'react-notifications/lib/notifications.css';
import './assets/styles/font-awesome/css/all.css'
import './assets/styles/style.scss'
// Middleware
import createSagaMiddleware from 'redux-saga'
import 'babel-polyfill'
import rootSaga from './launchpad/sagas/sagas.js'

const sagaMiddleware = createSagaMiddleware();
// const store = createStore(combineReducer, compose(applyMiddleware(sagaMiddleware), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()));
const store = createStore(combineReducer, compose(applyMiddleware(sagaMiddleware)));
sagaMiddleware.run(rootSaga);

//Code-Splitting, split launchpad to user-site(App) and admin-site(Admin)
const App = lazy(() => import('./launchpad/routers/router' /* webpackChunkName: 'app' */));
// const Admin = lazy(() => import('./launchpad/routers/admin' /* webpackChunkName: 'admin' */))

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Suspense fallback={<LoadingPage/>}>
        <Switch>
          <Route path='/' component={() => <App/>}/>
        </Switch>
      </Suspense>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
