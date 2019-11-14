
DataLab is a web service to provide data science workspace on kubernetes includes the following functions

1. Customizable data science lab
2. Function as a service

# Components

![Alt text](datalab_code_structure_v1.png?raw=true "Datalab Code Structure")

|  Name  | Description |
| ---- | ---- |
|  datalab-web  | Frontend service for serving web/api/auth |
|  datalab-server  | Backend service for serving users requests such as lab,faas  |

# Prerequisites

## Frontend

* node 11.6+
* yarn 1.12.3+
* webpack 4

## Backend

* go 1.11.4+
* beeog 1.11.1+
### Init project at first time

```
$ export GOROOT=/usr/local/go  # Choose your go installed directory
$ export GOPATH=$HOME/go
$ export PATH=$PATH:$GOROOT/bin:$GOPATH/bin

$ go get -u github.com/astaxie/beego
$ go get -u github.com/beego/bee
```

Note.

``bee`` may not be install correctly.

Workaround
```
$ cd ~/go/src
$ mkdir beego
$ cd beego
$ git clone https://github.com/beego/bee.git
$ cd bee
$ go build
$ cp bee ~/go/bin
```



```
$ cd $ProjectHome
# Init root project
$ go mod init github.com/rakutentech/data-science-platform/datalab
# Init submodule
$ cd $ProjectHome/datalab-admin/
$ go mod init github.com/rakutentech/data-science-platform/datalab/datalab-admin
$ cd $ProjectHome/datalab-server/
$ go mod init github.com/rakutentech/data-science-platform/datalab/datalab-server
```

### Add go tools 

```
$ vim ~/.bashrc
export GOROOT=/usr/local/go  # Choose your go installed directory
export PATH=$PATH:$GOROOT/bin:$HOME/go/bin
```

# Development

Recommended tool: VSCode 1.30.2+ (For ``go mod``)

When use VSCode to develop, open submodule(datalab/datalab-xxx) instead of root project(datalab)


We adapt [Fork & Pull](https://github.com/sevntu-checkstyle/sevntu.checkstyle/wiki/Development-workflow-with-Git:-Fork,-Branching,-Commits,-and-Pull-Request) to develop this project.

1. Fork this repo.
2. Clone source code from your repo.
3. Add ``upstream`` setting

```
$ vim .git/config

...
[remote "upstream"]
        url = https://github.com/rakutentech/data-science-platform/datalab.git
        fetch = +refs/heads/*:refs/remotes/origin/*
        fetch = +refs/pull-requests/*/from:refs/remotes/pr/*
```

You can fetch/pull upstream code PR by
```
$ git ls-remote upstream
$ git pull upstream master
```

You can fetch/pull  PR by
```
$ git ls-remote upstream
$ git fetch upstream refs/pull-requests/1/from
$ git pull upstream refs/pull-requests/1/from
```

We use `make` as development tool.

## Build
```
$ make build
```

## Run dev mode
```
$ make run-dev
```

## Run prod mode
```
$ make run-prod
```

## Test
```
$ make test-web
$ make test-backend
```

## Build docker image
```
$ make docker-web WEB-NAME=<image name>
$ make docker-backend BACKEND-NAME=<image name>
```

## Submit Docker Image
```
$ docker login YOUR_DOCKERHUB_ADDRESS
$ VERSION=1.0.x
$ docker tag datalab-web YOUR_DOCKERHUB_ADDRESS/datalab-web:$VERSION
$ docker push YOUR_DOCKERHUB_ADDRESS/datalab-web:$VERSION
$ docker tag datalab-server YOUR_DOCKERHUB_ADDRESS/datalab-server:$VERSION
$ docker push YOUR_DOCKERHUB_ADDRESS/datalab-server:$VERSION
```

## MySQL Setup (Option)
```
$ sudo yum install mariadb mariadb-server
$ sudo systemctl enable mariadb
$ sudo systemctl start mariadb

$ sudo mysql
$ mysql> create database datalab;
$ mysql> grant all on datalab.* to datalab@'%' identified by 'datalab';
$ mysql> grant all on datalab.* to datalab@'localhost' identified by 'datalab';
```
