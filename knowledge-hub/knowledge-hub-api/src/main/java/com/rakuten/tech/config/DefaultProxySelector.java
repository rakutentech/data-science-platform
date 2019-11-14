package com.rakuten.tech.config;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.ProxySelector;
import java.net.SocketAddress;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "spring")
@Configuration
public class DefaultProxySelector extends ProxySelector {

  private Map<String, String> proxies;

  public Map<String, String> getProxies() {
    return proxies;
  }

  public void setProxies(Map<String, String> proxies) {
    this.proxies = proxies;
  }

  @Override
  public List<Proxy> select(URI uri) {
    for (String targetUrl : proxies.keySet()) {
      if (uri.getHost().contains(targetUrl)) {
        String[] hostPort = proxies.get(targetUrl).split(":");
        return Arrays.asList(new Proxy(Proxy.Type.HTTP,
            new InetSocketAddress(hostPort[0], Integer.parseInt(hostPort[1]))));
      }
    }
    return Arrays.asList(Proxy.NO_PROXY);
  }

  @Override
  public void connectFailed(URI arg0, SocketAddress arg1, IOException arg2) {
    // TODO Auto-generated method stub
  }
}
