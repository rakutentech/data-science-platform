
# Overview


FaaS library is for you can deploy faas by python.

You can use it to do unit test for your function.


# Usage

```python
from david import FaaS

# Connect to server by username/password
client = FaaS.connect('lab_host', lab_port, 'username', 'password')
# Connect to server by user token
client = FaaS.connect('lab_host', lab_port, token='xxxxxxxxxxxx')

code = '''
def handler(request, response):
    result = "Hello world!"
    response.set_data("Hello FaaS!, this is a {} request. Result: {}".format(request.method, result))
    response.headers['X-Frame-Options'] = "SAMPLE_VALUE"
'''


# Create a instance with code
instance = client.create_function(
    name='cli',
    trigger='http',
    function_name='faas-conda3-full',
    instance_type='s1.large',
    function_code=code
)

# Create a instance with zipfile
instance = client.create_function(
    name='cli',
    trigger='http',
    function_name='faas-conda3-full',
    instance_type='s1.large',
    zip_file_path='/home/my/myproject.zip',
    zip_entrypoint='function.py'
)

# Create a instance with github project
instance = client.create_function(
    name='cli',
    trigger='http',
    function_name='faas-conda3-full',
    git_repo="ssh://git@git.jp:7999/faas-src-repo-1.git",
    git_branch="develop",
    git_entrypoint="function.py"
)


# Check endpoint and running instances
print(instance.check_status())
# Check endpoint
print(instance.get_endpoint())

# Test endpoint
instance.get(headers=None, data=None, files=None).text
instance.post(headers=None, data=None, files=None).text
instance.put(headers=None, data=None, files=None).text
instance.delete(headers=None, data=None, files=None).text


# Other operations
# Find instance 
instance = client.get_instance("cli")
# Restart instance
instance.restart()
# Update instance
instance.update(instance_number=1, function_code=code, function_requirement="")
# Destroy
instance.destroy()

# Event job operation
## Submit Job
instance = client.create_function(
    name='myj2',
    trigger='event',
    function_name='job',
    instance_type='s1.tiny',
    function_code='echo "Hello world"'
)

job = instance.submit_job()
job = instance.submit_job(before_execution="", command="", args=[], env={})
status, output = job.getstatusoutput()

```
