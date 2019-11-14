import React, {lazy, Suspense} from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './datalab/reducers'
import { Provider } from 'react-redux'
import config from 'config'
import LoadingPage from './datalab/components/LoadingPage'
import style from './assets/styles/style.scss';

// External CSS import 
import 'bootstrap/dist/css/bootstrap.css'
import 'react-bootstrap-table/dist/react-bootstrap-table.min.css'
import 'react-dropzone-component/styles/filepicker.css'

// Middleware
import createSagaMiddleware from 'redux-saga'
import 'babel-polyfill'
import rootSaga from './datalab/sagas/sagas.js'

const sagaMiddleware = createSagaMiddleware()
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware))
sagaMiddleware.run(rootSaga)


//Code-Splitting, split datalab to user-site(App) and admin-site(Admin)
const App = lazy(() => import('./datalab/routers/app' /* webpackChunkName: 'app' */))
const Admin = lazy(() => import('./datalab/routers/admin' /* webpackChunkName: 'admin' */))

function main(){
  ReactDOM.render(
    <Provider className={style} store={store}>
      <BrowserRouter>
        <Suspense fallback={<LoadingPage/>}>
          <Switch>
            <Route path={config.adminPath} component={() => <Admin/>}/>
            <Route path='/' component={() => <App/>}/>
          </Switch>
        </Suspense>
      </BrowserRouter>
    </Provider>,
    document.getElementById('root')
  );
}

// FakeBackend
if (config.fakeBackend) {
import('./datalab/fakebackends' /* webpackChunkName: 'fakeBackend' */).then(
  (model) =>{
    model.configureFakeBackend();
    main()
  }
)
}else{
  main()
}


