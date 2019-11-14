#!/bin/bash

NAMESPACE=delivery-launchpad
DEPLOY_NAME=launchpad-ui
ENV=dev

NAMESPACE_COUNT=`kubectl get namespaces | grep -c ${NAMESPACE}`
if [ ${NAMESPACE_COUNT} -eq 0 ]; then
    kubectl create namespace ${NAMESPACE}
fi

helm install --namespace=${NAMESPACE} --name ${DEPLOY_NAME} -f pipeline/cd/values-${ENV}.yaml \
--set deploy.replica=1 \
--set ingress.hostname="localhost" \
--set ingress.path="/" \
--set deploy.subfix="" \
pipeline/cd/
