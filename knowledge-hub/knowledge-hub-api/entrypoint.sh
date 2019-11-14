#!/bin/sh

java -server \
-Djava.security.egd=file:/dev/./urandom \
-Xms1g \
-Xmx3g \
-jar /app.jar
