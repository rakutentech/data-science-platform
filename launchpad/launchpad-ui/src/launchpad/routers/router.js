import React from 'react'
import {BrowserRouter, Route, Switch} from 'react-router-dom'

import Index from '../pages/index';

const Router = () =>{
  return (
    <div>
      <BrowserRouter basename="/">
        <Switch>
          <Route path='/' component={Index} />
        </Switch>
      </BrowserRouter>
    </div>
  )
};

export default Router
