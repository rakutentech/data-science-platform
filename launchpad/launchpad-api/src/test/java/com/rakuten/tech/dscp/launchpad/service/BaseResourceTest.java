package com.rakuten.tech.dscp.launchpad.service;

import io.fabric8.kubernetes.client.Config;
import io.fabric8.kubernetes.client.ConfigBuilder;
import io.fabric8.kubernetes.client.DefaultKubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.server.mock.KubernetesServer;
import me.snowdrop.istio.client.DefaultIstioClient;
import me.snowdrop.istio.client.IstioClient;
import org.junit.Rule;

public class BaseResourceTest {
    @Rule
    public KubernetesServer server = new KubernetesServer(false);

    KubernetesClient kubernetesClient;

    IstioClient istioClient;

    public BaseResourceTest() {
        Config config = new ConfigBuilder().withApiVersion("v1").withMasterUrl("<K8S Master Server>").withNamespace("delivery-launchpad")
//                .withCaCertData(certData)
//                .withCaCertFile("./cert-stg.pem")
                .withTrustCerts(true).build();
        kubernetesClient = new DefaultKubernetesClient(config);

        istioClient = new DefaultIstioClient(config);

    }
}
