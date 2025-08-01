package com.reactit.kyc.supp.web.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Refresh oauth2 tokens.
 */
@Component
public class OAuth2RefreshTokensWebFilter extends OncePerRequestFilter {

    private final OAuth2AuthorizedClientManager clientManager;
    private final OAuth2AuthorizedClientRepository authorizedClientRepository;
    private final OAuth2AuthorizationRequestResolver authorizationRequestResolver;
    private final RedirectStrategy authorizationRedirectStrategy = new DefaultRedirectStrategy();

    public OAuth2RefreshTokensWebFilter(
        OAuth2AuthorizedClientManager clientManager,
        OAuth2AuthorizedClientRepository authorizedClientRepository,
        ClientRegistrationRepository clientRegistrationRepository
    ) {
        this.clientManager = clientManager;
        this.authorizedClientRepository = authorizedClientRepository;
        this.authorizationRequestResolver = new DefaultOAuth2AuthorizationRequestResolver(
            clientRegistrationRepository,
            OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI
        );
    }

    @Override
    public void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws IOException, ServletException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if ((authentication instanceof OAuth2AuthenticationToken)) {
            try {
                OAuth2AuthorizedClient authorizedClient = authorizedClient((OAuth2AuthenticationToken) authentication);
                this.authorizedClientRepository.saveAuthorizedClient(authorizedClient, authentication, request, response);
            } catch (Exception e) {
                OAuth2AuthorizationRequest authorizationRequest = this.authorizationRequestResolver.resolve(request);
                if (authorizationRequest != null) {
                    this.authorizationRedirectStrategy.sendRedirect(request, response, authorizationRequest.getAuthorizationRequestUri());
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private OAuth2AuthorizedClient authorizedClient(OAuth2AuthenticationToken oauth2Authentication) {
        String clientRegistrationId = oauth2Authentication.getAuthorizedClientRegistrationId();
        OAuth2AuthorizeRequest request = OAuth2AuthorizeRequest.withClientRegistrationId(clientRegistrationId)
            .principal(oauth2Authentication)
            .build();
        if (clientManager == null) {
            throw new IllegalStateException(
                "No OAuth2AuthorizedClientManager bean was found. Did you include the " +
                "org.springframework.boot:spring-boot-starter-oauth2-client dependency?"
            );
        }
        return clientManager.authorize(request);
    }
}
