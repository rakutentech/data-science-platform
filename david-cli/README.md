# david

This project aim to provide

* cli tool: a command line tool to deploy openlab setting
* openlab library: python library of openlab
  * [FaaS](david/faas/README.md)

## Prerequisites

* Python 2.7+, 3.6+

# Install
```
python setup.py install
```


# Deploy

Deploy package to PyPI Repositories.

1. Edit  ~/.pypirc
``` ~/.pypirc
[distutils]
index-servers =
  pypi
  local
 
[pypi]
username:
password:
 
[local]
repository: <artifactory>
username: <account>
password: <password>
```

2. Submit
```
$ python setup.py sdist upload -r local
```

# Cli Usage

Cli tool is for deploy openlab setting.

We prepare some examples on the [examples] folder

Format is
```yaml
type: xxx
items:
- name: xxx
  spec:
    xxx
```

Supported settings

* labsetting
* functionsetting
* user
* permission

## Prepare ~/.david.yml

Prepare ~/.david.yml for connecting to openlab

```bash
$ vim ~/.david.yml
```

### For Admin

```yaml ~/.david.yml
admin:
  url: https://datalab_url
  username: admin_name
  password: admin_name
```

### For Normal User

```yaml ~/.david.yml
datalab:
  host: xxxx
  port: xxxx
# Auth method: token
  token: xxxxx
# Auth method: user
  username: xxxx
  password: xxxx
```

Example, please change host to your deployed hostname
```
datalab:
  host: HOSTNAME
  port: 443
  protocol: https
  token: xxxxxxxxx
```

# Admin Operations

## Create Settings

```bash
$ david admin create -f examples/labsetting.yml
```

## Update Settings

```bash
$ david admin update -f examples/labsetting.yml
```

## Delete Settings

```bash
$ david admin delete -f examples/labsetting.yml
```

## Sync Settings

```bash
$ david admin sync -f examples/labsetting.yml
```

Note. sync command will let online database to be synced to your config.


# Normal User Operations

## List Function Instance

```bash
$ david function list
```


## Create Function Instance

```bash
$ david function create -f examples/functions.yml
```

## Delete Function Instance

```bash
$ david function delete -f examples/functions.yml
```

## Apply Function Instance

```bash
$ david function apply -f examples/functions.yml
```

## Restart Function Instance

```bash
$ david function restart -f examples/functions.yml
```

## Run Event Job

```bash
$ david function run myjob arg1 arg2
$ david function run -e http_proxy=xxx -e https_proxy=xxx myjob arg1 arg2
```

## List Datalab Instance

```bash
$ david datalab list
```

## Create Datalab Instance

```bash
$ david datalab create -f examples/datalab.yml
```

## Delete DataLab Instance

```bash
$ david datalab delete -f examples/datalab.yml
```

# Library Usage

Refer to:

* [FaaS](david/faas/README.md)
