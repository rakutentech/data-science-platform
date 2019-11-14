import  React from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

const Auth = (props) => {
  return (
    localStorage.getItem(props.tokenName)? (
    /* eslint react/no-children-prop: 0 */
      <Route children={props.children} />
    ) : (
      <Redirect to={'/login'} />
    )
  )
}

Auth.propTypes ={
  children: PropTypes.object,
  tokenName: PropTypes.string,
  appRoot: PropTypes.string
}

export default Auth