package com.rakuten.tech.dscp.launchpad;

import io.fabric8.kubernetes.client.Config;
import io.fabric8.kubernetes.client.ConfigBuilder;
import io.fabric8.kubernetes.client.DefaultKubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.minio.MinioClient;
import io.minio.errors.InvalidEndpointException;
import io.minio.errors.InvalidPortException;
import me.snowdrop.istio.client.DefaultIstioClient;
import me.snowdrop.istio.client.IstioClient;
import org.mlflow.tracking.MlflowClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.lang.reflect.Field;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@EnableSwagger2
@EnableScheduling
@EnableAsync
public class ApplicationServer {

    @Value("${k8s.apiVersion}")
    private String k8sApiVersion;

    @Value("${k8s.url}")
    private String k8sUrl;

    @Value("${k8s.username}")
    private String k8sUsername;

    @Value("${k8s.token}")
    private String k8sToken;

    @Value("${k8s.ns.launchpad}")
    private String nsLaunchpad;

    @Value("${mlflow.tracking.uri}")
    private String trackingUri;

    @Value("${mlflow.minio.aws_access_key_id}")
    private String accessKey;

    @Value("${mlflow.minio.aws_secret_access_key}")
    private String secretKey;

    @Value("${mlflow.minio.mlflow_s3_endpoint_url}")
    private String minioService;

    public static void main(String[] args) {
        SpringApplication.run(ApplicationServer.class, args);
    }

    @SuppressWarnings("unchecked")
    private static void setEnv(Map<String, String> newenv) throws Exception {
        try {
            Class<?> processEnvironmentClass = Class.forName("java.lang.ProcessEnvironment");
            Field theEnvironmentField = processEnvironmentClass.getDeclaredField("theEnvironment");
            theEnvironmentField.setAccessible(true);
            Map<String, String> env = (Map<String, String>) theEnvironmentField.get(null);
            env.putAll(newenv);
            Field theCaseInsensitiveEnvironmentField = processEnvironmentClass.getDeclaredField("theCaseInsensitiveEnvironment");
            theCaseInsensitiveEnvironmentField.setAccessible(true);
            Map<String, String> cienv = (Map<String, String>) theCaseInsensitiveEnvironmentField.get(null);
            cienv.putAll(newenv);
        } catch (NoSuchFieldException e) {
            Class[] classes = Collections.class.getDeclaredClasses();
            Map<String, String> env = System.getenv();
            for (Class cl : classes) {
                if ("java.util.Collections$UnmodifiableMap".equals(cl.getName())) {
                    Field field = cl.getDeclaredField("m");
                    field.setAccessible(true);
                    Object obj = field.get(env);
                    Map<String, String> map = (Map<String, String>) obj;
                    map.clear();
                    map.putAll(newenv);
                }
            }
        }
    }

    @Bean
    public Docket docket() {
        return new Docket(DocumentationType.SWAGGER_2).apiInfo(new ApiInfoBuilder().contact(new Contact("", "", "")).title("Launchpad APIs Document").version("1.0").build()).useDefaultResponseMessages(false).select().apis(RequestHandlerSelectors.basePackage("com.rakuten.tech.dscp.launchpad.controller")).paths(PathSelectors.any()).build();
    }

    @Bean
    public KubernetesClient k8sClient() {
        Config config = new ConfigBuilder().withApiVersion(k8sApiVersion).withMasterUrl(k8sUrl).withUsername(k8sUsername).withOauthToken(k8sToken).withNamespace(nsLaunchpad).withTrustCerts(true).build();

        return new DefaultKubernetesClient(config);
    }

    @Bean
    public IstioClient istioClient() {
        Config config = new ConfigBuilder().withMasterUrl(k8sUrl).withApiVersion(k8sApiVersion).withUsername(k8sUsername).withOauthToken(k8sToken).withTrustCerts(true).withNamespace(nsLaunchpad).build();
        return new DefaultIstioClient(config);
    }

    @Bean
    public MlflowClient mlflowClient() throws Exception {
        Map<String, String> map = new HashMap<>();

        map.put("AWS_ACCESS_KEY_ID", accessKey);
        map.put("AWS_SECRET_ACCESS_KEY", secretKey);
        map.put("MLFLOW_S3_ENDPOINT_URL", minioService);
        map.put("MLFLOW_TRACKING_URI", trackingUri);
        setEnv(map);

        return new MlflowClient();
    }

    @Bean
    public MinioClient minioClient() throws InvalidPortException, InvalidEndpointException {
        return new MinioClient(this.minioService, this.accessKey, this.secretKey);
    }
}
