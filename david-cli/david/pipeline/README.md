# Overview


Pipeline helps you deploy faas in jupyter notebook quickly by python.
You can use it to deploy and test your function as a service.


# Usage

```python
from david import Pipeline

client = Pipeline.connect('lab_host', lab_port, 'username', 'password')

# Pipeline.deploy(model, model_path, instance_name, function_name)
#  model: The model object you've trained in Jupyterlab
#  model_path: Save the model to local space in k8s
# instance_name: the function instance you want to use (py2-flask-normal, py2-flask-science, py3-flask-normal, py3-flask-science) 
# function_name: Name the function instance in k8s Cluster
client.deploy(your_model_obj, "/path_to_model/model_name.sav", "faas_instance_name", "py3-flask-science")


# get the endpoint after deploy
client.get_endpoint() # get end point of current loaded instance
client.get_endpoint("instance_name") # get end point of "instance_name"

# Test endpoint, supported format list, json, panda data frame
client.predit(input_records) 

# Other operations
# Find instance, return list of available running instances
client.get_instances() 

# Load an instance
client.load("instance name")

```
