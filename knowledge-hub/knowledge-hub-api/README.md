
# Knowledge-Hub-API
Knowledge Hub is a platform for the data scientists to publish and share the data science work. Scientists can publish their Jupyter notebooks, find insights(including model data training/analysing use case, introducing model/API) here.
Guest(non-tech user) can browse related projects to find a way/possibility to solve problems with AI. <br>

This is knowledge hub api which is built based on java8/spring boot/maven/docker <br>

---
## Tech Stack
* [Java8](www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html)
* [Spring Boot](https://projects.spring.io/spring-boot)
* [MySQL](https://www.mysql.com)
* [H2 Database](http://www.h2database.com/html/main.html)
* [Swagger](http://springfox.github.io/springfox/docs/current)
* [SLF4J](https://www.slf4j.org)
* [Logback](https://logback.qos.ch)
* [Lombok](https://projectlombok.org)
* [Maven](https://maven.apache.org)
* [Docker](https://www.docker.com)

<br>

---

## Start working on the project

- **Build jar package**
Please install java8/maven/git on your local before start

```
git clone 
mvn clean package
```

- **Run application**
```
java -jar target/knowledge-hub-api.jar
```

- **Build docker image**
```
docker build . -t knowledge-hub-api:1.0
```
- **Run docker container**
```
docker run -p 8080:8080 knowledge-hub-api:1.0
```
- **Access API Document**
[http://localhost:8080/knowledge-hub-api/swagger-ui.html](http://localhost:8080/knowledge-hub-api/swagger-ui.html)

![KnowledgeHub](image/swagger.jpg)

<br>

---

## Features
- **API Version**
Api has version control in the url, like **http://localhost:8000/knowledge-hub-api/kh/v1/notebooks**, **http://localhost:8000/knowledge-hub-api/kh/v2/notebooks**.
If the input/output has changed, you must change the version number, and keep all versions are available unless you are sure that one version is not used any more. 

- **API URL**
The URL definition is follow the rest rules, for concrete concept please refer to [JSON API]. <br>
Examples:

```
http://localhost:8080/knowledge-hub-api/kh/v1/notebooks?recordStatus=0
http://localhost:8080/knowledge-hub-api/kh/v1/notebooks/1?recordStatus=0
```
- **API Parameter**
All the input/output parameter names are camelCase format. <br>
Examples:

| Operation       	| Http Type 	| Curl Command                                                                                                                                                                                                                                    	|   	|   	|
|-----------------	|-----------	|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|---	|---	|
| Get Notebooks   	| GET       	| curl -X GET "http://localhost:8080/knowledge-hub-api/kh/v1/notebooks?recordStatus=0" -H "accept: */*"                                                                                                                                           	|   	|   	|
| Create Notebook 	| POST      	| curl -X POST "http://localhost:8080/knowledge-hub-api/kh/v1/notebooks/4?authorIds=1&authorNames=chen¬ebookId=4&title=example&recordStatus=5" -H "accept: */*" -H "Content-Type: multipart/form-data" -F "notebookFile=@MNIST-Copy1.ipynb;type=" 	|   	|   	|
| Delete Notebook 	| DELETE    	| curl -X DELETE "http://localhost:8080/knowledge-hub-api/kh/v1/notebooks/4" -H "accept: */*"                                                                                                                                                     	|   	|   	|

<br>

---

## GIT - commit changes & Pull request

All the latest updates are always in the `develop` branch. You should always follow these steps to send your latest updates:

We adapt [Fork & Pull](https://github.com/sevntu-checkstyle/sevntu.checkstyle/wiki/Development-workflow-with-Git:-Fork,-Branching,-Commits,-and-Pull-Request) to develop this project.

1. Fork this repo.
2. Clone source code from your repo.

When you finish your code and want to merge with master branch in main repository, make your changes locally and then add, commit, and push your changes to the `<feature>` branch:
```
git add .
git commit -m "adding a change from the feature branch"
git push origin <feature>
```

You can see all branches created by using :
```
git branch -a
```
Which will show :

- approval_messages
  master
  master_clean


Update your branch when the original branch from official repository has been updated :
```
git fetch [name_of_your_remote]
```
Then you need to apply to merge changes, if your branch is derivated from develop you need to do :

```
git merge [name_of_your_remote]/develop
```
Delete a branch on your local filesystem :

```
git branch -d [name_of_your_new_branch]
```

- **Pull request**

You should always create a `pull request` to merge your local branch with the remote into `develop` branch [only `develop` branch].

##### Read more about [Making a Pull Request in atlassian](https://www.atlassian.com/git/tutorials/making-a-pull-request)

<br>

---

## Branch name policy

Here are some branch naming conventions that I use and the reasons for them

##### Branch naming conventions:
- Use grouping tokens (words) at the beginning of your branch names.
- Define and use short lead tokens to differentiate branches in a way that is meaningful to your workflow.
- Use slashes to separate parts of your branch names.
- Do not use bare numbers as leading parts.
- Avoid long descriptive names for long-lived branches.
- Group tokens

##### Use "grouping" tokens in front of your branch names.

- group1/foo
- group2/foo
- group1/bar
- group2/bar
- group3/bar
- group1/baz

The groups can be named whatever you like to match your workflow. I like to use short nouns for mine. Read on for more clarity.

##### Short well-defined tokens

Choose short tokens so they do not add too much noise to every one of your branch names. I use these:

- wip       Works in progress; stuff I know won't be finished soon
- feat      Feature I'm adding or expanding
- bug       Bug fix or experiment
- junk      Throwaway branch created to experiment


Ream more about [commonly used practices for naming git branches in stackoverflow](https://stackoverflow.com/questions/273695/what-are-some-examples-of-commonly-used-practices-for-naming-git-branches)

<br>

---

## Unit Test
Execute `mvn clean test` to run unit test, and it will also generate test coverage report, the report is under target/site/jacoco, please open **index.html** in browser
