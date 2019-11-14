
// validatedSubmit is for validating form input format
export const validatedSubmit = (target, submitFunc) =>{
  return (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.target.checkValidity()) {
      target.setState({'validated': 'was-validated'});
      return;
    }
    return submitFunc(e)
  }
};

export const withSuccessFailure = (requestName) => {
  return [requestName, `${requestName}_SUCCESS`, `${requestName}_FAILURE`]
};
