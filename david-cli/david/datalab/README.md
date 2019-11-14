
# Overview


FaaS library is for you can deploy faas by python.

You can use it to do unit test for your function.


# Usage

```python
from david import DataLab

# Connect to server by username/password
client = DataLab.connect('lab_host', lab_port, 'username', 'password')
# Connect to server by user token
client = DataLab.connect('lab_host', lab_port, token='xxxxxxxxxxxx')


# Create a instance with code
instance = client.create_datalab(
    name='mylab',
    lab_name='Jupyter',
    instance_type='s1.large'
)


# Other operations
# Find instance 
instance = client.get_instance("mylab", "Jupyter")
# Destroy
instance.destroy()

```
