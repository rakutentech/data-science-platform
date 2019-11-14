


# Init
```
$ go mod init github.com/rakutentech/data-science-platform/datalab/datalab-server 
# Download dependency
$ go mod tidy
$ go mod verify
```

# Run
```
$ bee run
```

# Test
```
# clear cache(option)
$ go clean -testcache

# Test Single funtion
$ env TEST_LAB_MODE=1 go test -v ./tests -run TestClusterInfoAPI

# Test all functions
$ env TEST_LAB_MODE=1 go test -v ./tests

```

# Docker
```
$ docker build -t datalab .
$ docker run --rm -d -p 8080:8080 --name datalab datalab
```
