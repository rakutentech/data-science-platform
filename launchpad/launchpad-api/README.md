
# launchpad-api
This is the ML management component of Data Science Platform, focus on ML versioning & ML API

- - -
## Tech Stack
* [Java8](www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html)
* [Spring Boot](https://projects.spring.io/spring-boot)
* [Maven](https://maven.apache.org)
* [MySQL](https://www.mysql.com)
* [H2 Database](http://www.h2database.com/html/main.html)
* [JUnit5](https://junit.org/junit5)
* [Mybatis](http://www.mybatis.org/mybatis-3)
* [Swagger](http://springfox.github.io/springfox/docs/current)
* [Hateoas](https://projects.spring.io/spring-hateoas)
* [SLF4J](https://www.slf4j.org)
* [Logback](https://logback.qos.ch)
* [Lombok](https://projectlombok.org)
* [JSON API](http://jsonapi.org/recommendations)
* [Docker](https://www.docker.com)
* [CheckStyle](checkstyle.sourceforge.net)

## Installation
#### Build jar package
Please install java8/maven/git on your laptop before start
```sh
git clone <Repo URL>
cd launchpad-api && mvn clean package -U -B
```
#### Run application
```sh
java -jar target/launchpad-api.jar
```
#### Build docker image
Image will be taged as ${docker.image.prefix}/${project.artifactId}:${project.version}
```sh
mvn clean package dockerfile:build
```
#### Access API Document
[http://localhost:8080/swagger-ui.html](http://localhost:8000/swagger-ui.html)
- - -

#### Unit Test
Execute `mvn clean test` to run unit test, and it will also generate test coverage report, the report is under target/site/jacoco, please open **index.html** in browser
#### Check code
Execute `mvn clean compile checkstyle:checkstyle` to check code, and it will also generate check result report, the report is under target/site, please open **checkstyle.html** in browser
#### Code Style
* [Google Java Style](https://google.github.io/styleguide/javaguide.html)
- - -


