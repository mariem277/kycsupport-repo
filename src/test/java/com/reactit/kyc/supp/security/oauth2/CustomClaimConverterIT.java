package com.reactit.kyc.supp.security.oauth2;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.reactit.kyc.supp.IntegrationTest;
import com.reactit.kyc.supp.security.AuthoritiesConstants;
import com.reactit.kyc.supp.security.SecurityUtils;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.client.RestTemplate;

@IntegrationTest
class CustomClaimConverterIT {

    private static final String USERNAME = "admin";
    private static final String NAME = "John";
    private static final String FAMILY_NAME = "Doe";
    private static final String FULL_NAME = NAME + " " + FAMILY_NAME;
    private static final String NAME_SUFFIX = "Sr.";
    private static final String EMAIL = "john.doe@gmail.com";

    private final ObjectMapper mapper = new ObjectMapper();

    @MockitoBean
    private RestTemplate restTemplate;

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    private CustomClaimConverter customClaimConverter;

    @BeforeEach
    void initTest() {
        customClaimConverter = new CustomClaimConverter(clientRegistrationRepository.findByRegistrationId("oidc"), restTemplate);
    }

    private void mockHttpGetUserInfo(ObjectNode userInfo) {
        when(
            restTemplate.exchange(
                eq("https://api.jhipster.org/user"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                ArgumentMatchers.<Class<ObjectNode>>any()
            )
        ).thenReturn(ResponseEntity.ok(userInfo));
    }

    @Test
    void testConvert() {
        // GIVEN
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "123");
        // AND
        ObjectNode user = mapper.createObjectNode();
        user.put("preferred_username", USERNAME);
        user.put("given_name", NAME);
        user.put("family_name", FAMILY_NAME);
        user.putArray("groups").add(AuthoritiesConstants.ADMIN).add(AuthoritiesConstants.USER);
        mockHttpGetUserInfo(user);

        // WHEN
        Map<String, Object> convertedClaims = customClaimConverter.convert(claims);

        // THEN
        assertThat(convertedClaims)
            .containsEntry("sub", "123")
            .containsEntry("preferred_username", USERNAME)
            .containsEntry("given_name", NAME)
            .containsEntry("family_name", FAMILY_NAME)
            .containsEntry("groups", Arrays.asList(AuthoritiesConstants.ADMIN, AuthoritiesConstants.USER));
    }

    @Test
    void testConvert_withoutGroups() {
        // GIVEN
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "123");
        // AND
        ObjectNode user = mapper.createObjectNode();
        user.put("preferred_username", USERNAME);
        user.put("given_name", NAME);
        user.put("family_name", FAMILY_NAME);
        mockHttpGetUserInfo(user);

        // WHEN
        assertThatCode(() -> customClaimConverter.convert(claims)).doesNotThrowAnyException();
    }

    @Test
    void testConvert_withNamespacedRoles() {
        // GIVEN
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "123");
        // AND
        ObjectNode user = mapper.createObjectNode();
        user.put("preferred_username", USERNAME);
        user.put("given_name", NAME);
        user.put("family_name", FAMILY_NAME);
        user.putArray(SecurityUtils.CLAIMS_NAMESPACE + "roles").add(AuthoritiesConstants.ADMIN).add(AuthoritiesConstants.USER);
        mockHttpGetUserInfo(user);

        // WHEN
        Map<String, Object> convertedClaims = customClaimConverter.convert(claims);

        // THEN
        assertThat(convertedClaims)
            .containsEntry("sub", "123")
            .containsEntry("preferred_username", USERNAME)
            .containsEntry("given_name", NAME)
            .containsEntry("family_name", FAMILY_NAME)
            .containsEntry("roles", Arrays.asList(AuthoritiesConstants.ADMIN, AuthoritiesConstants.USER));
    }

    @Test
    void testConvert_withoutFirstAndLastName() {
        // GIVEN
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "123");
        // AND
        ObjectNode user = mapper.createObjectNode();
        user.put("preferred_username", USERNAME);
        mockHttpGetUserInfo(user);

        assertThatCode(() -> {
            Map<String, Object> convertedClaims = customClaimConverter.convert(claims);
            assertThat(convertedClaims).containsEntry("preferred_username", USERNAME).doesNotContainKeys("given_name", "family_name");
        }).doesNotThrowAnyException();
    }

    @Test
    void testConvert_withName() {
        // GIVEN
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "123");
        // AND
        ObjectNode user = mapper.createObjectNode();
        user.put("preferred_username", USERNAME);
        user.put("name", FULL_NAME);
        mockHttpGetUserInfo(user);

        assertThatCode(() -> {
            Map<String, Object> convertedClaims = customClaimConverter.convert(claims);
            assertThat(convertedClaims)
                .containsEntry("preferred_username", USERNAME)
                .containsEntry("given_name", NAME)
                .containsEntry("family_name", FAMILY_NAME);
        }).doesNotThrowAnyException();
    }

    @Test
    void testConvert_withLastNameMultipleWords() {
        // GIVEN
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "123");
        // AND
        ObjectNode user = mapper.createObjectNode();
        user.put("preferred_username", USERNAME);
        user.put("name", FULL_NAME + " " + NAME_SUFFIX);
        mockHttpGetUserInfo(user);

        assertThatCode(() -> {
            Map<String, Object> convertedClaims = customClaimConverter.convert(claims);
            System.out.println(convertedClaims);
            assertThat(convertedClaims)
                .containsEntry("preferred_username", USERNAME)
                .containsEntry("given_name", NAME)
                .containsEntry("family_name", FAMILY_NAME + " " + NAME_SUFFIX);
        }).doesNotThrowAnyException();
    }

    @Test
    void testConvert_withEmail() {
        // GIVEN
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "123");
        // AND
        ObjectNode user = mapper.createObjectNode();
        user.put("preferred_username", USERNAME);
        user.put("email", EMAIL);
        mockHttpGetUserInfo(user);

        assertThatCode(() -> {
            Map<String, Object> convertedClaims = customClaimConverter.convert(claims);
            assertThat(convertedClaims).containsEntry("preferred_username", USERNAME).containsEntry("email", EMAIL);
        }).doesNotThrowAnyException();
    }
}
