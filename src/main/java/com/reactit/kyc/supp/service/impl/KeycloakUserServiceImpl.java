package com.reactit.kyc.supp.service.impl;

import com.reactit.kyc.supp.service.KeycloakUserService;
import com.reactit.kyc.supp.service.dto.UserRegistrationRecord;
import jakarta.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class KeycloakUserServiceImpl implements KeycloakUserService {

    private static final Logger log = LoggerFactory.getLogger(KeycloakUserServiceImpl.class);

    private final Keycloak keycloak;
    private final String realm;

    public KeycloakUserServiceImpl(Keycloak keycloak, @Value("${keycloak.realm}") String realm) {
        this.keycloak = keycloak;
        this.realm = realm;
        log.info("KeycloakUserServiceImpl initialized with realm: {}", realm);
    }

    @Override
    public UserRegistrationRecord createUser(UserRegistrationRecord userRegistrationRecord) {
        try {
            log.info("Creating user: {}", userRegistrationRecord.username());

            UserRepresentation user = new UserRepresentation();
            user.setEnabled(true);
            user.setUsername(userRegistrationRecord.username());
            user.setEmail(userRegistrationRecord.email());
            user.setFirstName(userRegistrationRecord.firstName());
            user.setLastName(userRegistrationRecord.lastName());
            user.setEmailVerified(true);

            CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
            credentialRepresentation.setValue(userRegistrationRecord.password());
            credentialRepresentation.setTemporary(false);
            credentialRepresentation.setType(CredentialRepresentation.PASSWORD);

            List<CredentialRepresentation> list = new ArrayList<>();
            list.add(credentialRepresentation);
            user.setCredentials(list);

            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            Response response = usersResource.create(user);
            log.info("User creation response status: {}", response.getStatus());

            if (Objects.equals(201, response.getStatus())) {
                return userRegistrationRecord;
            }

            log.error("Failed to create user. Status: {}", response.getStatus());
            return null;
        } catch (Exception e) {
            log.error("Error creating user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create user", e);
        }
    }

    private UsersResource getUsersResource() {
        try {
            log.debug("Getting users resource for realm: {}", realm);
            RealmResource realmResource = keycloak.realm(realm);
            return realmResource.users();
        } catch (Exception e) {
            log.error("Error getting users resource: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get users resource", e);
        }
    }

    @Override
    public UserRepresentation getUserById(String userId) {
        try {
            log.info("Getting user by ID: {}", userId);
            return getUsersResource().get(userId).toRepresentation();
        } catch (Exception e) {
            log.error("Error getting user by ID {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to get user by ID: " + userId, e);
        }
    }

    @Override
    public void deleteUserById(String userId) {
        try {
            log.info("Deleting user by ID: {}", userId);
            getUsersResource().delete(userId);
            log.info("User deleted successfully: {}", userId);
        } catch (Exception e) {
            log.error("Error deleting user by ID {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete user by ID: " + userId, e);
        }
    }

    @Override
    public List<UserRepresentation> getAllUsers() {
        try {
            log.info("Getting all users from realm: {}", realm);
            List<UserRepresentation> users = getUsersResource().list();
            log.info("Retrieved {} users", users.size());
            return users;
        } catch (Exception e) {
            log.error("Error getting all users: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get all users", e);
        }
    }
}
