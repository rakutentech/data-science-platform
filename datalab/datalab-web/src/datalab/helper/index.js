
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
}

// handleInputByName is for handling form input changeEvent
export const handleInputByName = (target) =>{
  return (e) => {
    const { name } = e.target;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    target.setState({ [name]: value });
  }
}
// handleCodeEditorByName is for handling form codeEditor changeEvent
export const handleCodeEditorByName = (target, name) =>{
  return (context) => {
    target.setState({ [name]: context });
  }
}

export const withSuccessFailure = (requestName) => {
  return [requestName, `${requestName}_SUCCESS`, `${requestName}_FAILURE`]
}

export function groupBy(keys, array){
  let result = {}
  if(keys && keys.length > 0 && array && array.length > 0){
    for(let i=0;i<array.length;i++){
      const data = array[i]
      const key = keys.map(k => data[k]).toString()
      if(result[key]){
        result[key] = [...result[key], data]
      }else{
        result[key] = [data]
      }
    }
  }
  return result
}

export const isRunning = (instance) => {
  return instance?(instance.PendingInstances == 0 && instance.RunningInstances > 0):false
}

export const runningTimeMessage = (instance) => {
  const diff = (new Date().getTime()/1000  - instance.CreateAt)
  const day = Math.floor(diff / 86400)
  if(day > 0){
    return `${day}d`
  }else{
    const hour = Math.floor((diff - day * 86400) / 3600)
    if(hour > 0){
      return `${hour}h`
    }else{
      return `${Math.ceil(diff/60)}m`
    }
  }
}