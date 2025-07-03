package com.reactit.kyc.supp;

import com.reactit.kyc.supp.config.AsyncSyncConfiguration;
import com.reactit.kyc.supp.config.EmbeddedRedis;
import com.reactit.kyc.supp.config.EmbeddedSQL;
import com.reactit.kyc.supp.config.JacksonConfiguration;
import com.reactit.kyc.supp.config.TestSecurityConfiguration;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(
    classes = { KycsupportApp.class, JacksonConfiguration.class, AsyncSyncConfiguration.class, TestSecurityConfiguration.class }
)
@EmbeddedRedis
@EmbeddedSQL
public @interface IntegrationTest {
}
