FROM python:3.6-slim

ENV MLFLOW_VERSION 1.0.0

WORKDIR /
RUN apt-get update \
   && mkdir -p /usr/share/man/man1 \
   && apt-get install -y ca-certificates wget openjdk-11-jdk

RUN pip install mlflow==${MLFLOW_VERSION}

COPY target/launchpad-api.jar app.jar
COPY pipeline/ci/entrypoint.sh .
COPY pipeline/ci/sysctl.conf /etc/sysctl.d/00-alpine.conf

RUN chmod +x entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
