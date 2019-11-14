#!/bin/bash

NAMESPACE=delivery-launchpad
DEPLOY_NAME=launchpad-api
ENV=dev

NAMESPACE_COUNT=`kubectl get namespaces | grep -c ${NAMESPACE}`
if [ ${NAMESPACE_COUNT} -eq 0 ]; then
    kubectl create namespace ${NAMESPACE}
fi

helm install --namespace=${NAMESPACE} --name ${DEPLOY_NAME} -f pipeline/cd/values-${ENV}.yaml \
--set deploy.replica=1 \
--set ingress.hostname="<Domain Name>" \
--set ingress.path="<Sub Path>" \
--set deploy.subfix="<Sub Path Suffix>" \
pipeline/cd/
