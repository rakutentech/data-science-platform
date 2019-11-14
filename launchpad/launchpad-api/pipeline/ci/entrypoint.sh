#!/bin/sh

export APP_NAME=$APP_NAME
export PROFILE=$PROFILE
export LOG_PATH=$LOG_PATH
export TIME_ZONE=$TIME_ZONE
export JAVA_OPTS=$JAVA_OPTS
export NAMESPACE=$NAMESPACE

if [ -z $APP_NAME ]; then
    APP_NAME=launchpad-api
fi

if [ -z $PROFILE ]; then
    PROFILE=dev
fi

if [ -z $LOG_PATH ]; then
    LOG_PATH=.
fi

if [ -z $TIME_ZONE ]; then
    TIME_ZONE=UTC
fi

java -server \
     -Djava.security.egd=file:/dev/./urandom \
     $JAVA_OPTS \
     -jar /app.jar \
     --spring.profiles.active=$PROFILE \
     --spring.application.timezone=$TIME_ZONE
