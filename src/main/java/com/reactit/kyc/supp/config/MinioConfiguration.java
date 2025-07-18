package com.reactit.kyc.supp.config;

import io.minio.MinioClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfiguration {

    private final Logger log = LoggerFactory.getLogger(MinioConfiguration.class);

    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Bean
    public MinioClient minioClient() {
        log.info("Initializing Minio client with URL: {}", minioUrl);
        return MinioClient.builder().endpoint(minioUrl).credentials(accessKey, secretKey).build();
    }
}
