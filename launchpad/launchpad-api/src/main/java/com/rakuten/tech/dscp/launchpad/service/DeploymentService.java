package com.rakuten.tech.dscp.launchpad.service;

import com.rakuten.tech.dscp.launchpad.entity.DeploymentEntity;
import io.fabric8.kubernetes.api.model.EnvVarBuilder;
import io.fabric8.kubernetes.api.model.NodeSelectorRequirementBuilder;
import io.fabric8.kubernetes.api.model.ProbeBuilder;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.DeploymentBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import me.snowdrop.istio.client.IstioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;

/**
 * k8s deployment management Service.
 *
 * @author zhusipeng
 * @date 2019/05/15
 */
@Service
public class DeploymentService extends ResourceService {

    @Value("${mlflow.minio.aws_access_key_id}")
    private String accessKey;

    @Value("${mlflow.minio.aws_secret_access_key}")
    private String secretKey;

    @Value("${mlflow.minio.mlflow_s3_endpoint_url}")
    private String endpointUrl;

    @Value("${mlflow.minio.bucket_name}")
    private String bucketName;

    @Value("${mlflow.tracking.uri}")
    private String trackingUrl;

    @Value("${k8s.deployment.replica}")
    private int replica;

    @Value("${k8s.deployment.resource.limits.cpu}")
    private String limitCpu;

    @Value("${k8s.deployment.resource.limits.memory}")
    private String limitMem;

    @Value("${k8s.deployment.resource.request.cpu}")
    private String requestCpu;

    @Value("${k8s.deployment.resource.request.memory}")
    private String requestMem;

    @Value("${spring.profiles}")
    private String profiles;

    @Value("${mlflow.image-name}")
    private String imageName;

    public DeploymentService(KubernetesClient k8sClient, IstioClient istioClient) {
        super(k8sClient, istioClient);
    }

    Deployment createDeployment(DeploymentEntity deploymentEntity) {

        Deployment deployment = new DeploymentBuilder().withNewMetadata().withName(deploymentEntity.getName()).addToLabels(deploymentEntity.getLabels()).endMetadata().withNewSpec().withReplicas(replica).withNewTemplate().withNewMetadata().addToLabels(deploymentEntity.getLabels()).endMetadata().withNewSpec().addNewContainer().withName(deploymentEntity.getName()).withImage(imageName).withImagePullPolicy(deploymentEntity.getImagePullPolicy()).withNewResources().addToLimits(Collections.singletonMap("cpu", new Quantity(requestCpu))).addToLimits(Collections.singletonMap("memory", new Quantity(requestMem))).addToRequests(Collections.singletonMap("cpu", new Quantity(limitCpu))).addToRequests(Collections.singletonMap("memory", new Quantity(limitMem))).endResources()
//                .withCommand("DATADOG_ENV="+profiles,"DATADOG_SERVICE_NAME="+deploymentEntity.getName(),"DATADOG_TRACE_AGENT_HOSTNAME","ddtrace-run","mlflow", "pyfunc", "serve", "-r" + deploymentEntity.getRunId(),
//                        "-m" + deploymentEntity.getModelPath(), "-h0.0.0.0", "--no-conda")
                //  .withArgs(" -r " + deploymentEntity.getRunId(), " -m " + deploymentEntity.getModelPath())
                .addToEnv(new EnvVarBuilder().withName("AWS_ACCESS_KEY_ID").withValue(accessKey).build()).addToEnv(new EnvVarBuilder().withName("AWS_SECRET_ACCESS_KEY").withValue(secretKey).build()).addToEnv(new EnvVarBuilder().withName("BUCKET_NAME").withValue(bucketName).build()).addToEnv(new EnvVarBuilder().withName("MLFLOW_S3_ENDPOINT_URL").withValue(endpointUrl).build()).addToEnv(new EnvVarBuilder().withName("MLFLOW_TRACKING_URI").withValue(trackingUrl).build()).addToEnv(new EnvVarBuilder().withName("MLFLOW_TYPE").withValue("client").build()).addToEnv(new EnvVarBuilder().withName("RUN_ID").withValue(deploymentEntity.getRunId()).build()).addToEnv(new EnvVarBuilder().withName("MODEL_PATH").withValue(deploymentEntity.getModelPath()).build()).addToEnv(new EnvVarBuilder().withName("PROFILE").withValue(profiles).build()).addToEnv(new EnvVarBuilder().withName("APP_NAME").withValue(deploymentEntity.getName()).build()).addToEnv(new EnvVarBuilder().withName("DD_TRACE_AGENT_PORT").withValue("8126").build()).addNewEnv().withName("DD_AGENT_HOST").withNewValueFrom().withNewFieldRef().withFieldPath("status.hostIP").endFieldRef().endValueFrom().endEnv().addNewPort().withContainerPort(deploymentEntity.getContainerPort()).endPort().withReadinessProbe(new ProbeBuilder().withInitialDelaySeconds(5).withPeriodSeconds(5).withNewExec().withCommand("cat", "/tmp/healthy").endExec().build()).endContainer().withNewAffinity().withNewNodeAffinity().withNewRequiredDuringSchedulingIgnoredDuringExecution().addNewNodeSelectorTerm().withMatchExpressions(Arrays.asList(new NodeSelectorRequirementBuilder().withKey("dscp.rakuten.com/app").withOperator("In").withValues("delivery-platform").build())).withMatchExpressions(Arrays.asList(new NodeSelectorRequirementBuilder().withKey("dscp.rakuten.com/component").withOperator("In").withValues("delivery-service").build())).endNodeSelectorTerm().endRequiredDuringSchedulingIgnoredDuringExecution().endNodeAffinity().endAffinity().endSpec().endTemplate().withNewSelector().addToMatchLabels(deploymentEntity.getLabels()).endSelector().endSpec().build();
        deployment = k8sClient.apps().deployments().createOrReplace(deployment);
        return deployment;
    }

    public Deployment getDeployment(String deploymentName) {
        return k8sClient.apps().deployments().withName(deploymentName).get();
    }

    boolean deleteDeployment(String deploymentName) {
        return k8sClient.apps().deployments().withName(deploymentName).delete();
    }
}
