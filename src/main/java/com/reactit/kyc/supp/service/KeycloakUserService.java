package com.reactit.kyc.supp.service;

import com.reactit.kyc.supp.service.dto.UserRegistrationRecord;
import java.util.List;
import org.keycloak.representations.idm.UserRepresentation;

public interface KeycloakUserService {
    UserRegistrationRecord createUser(UserRegistrationRecord userRegistrationRecord);

    UserRepresentation getUserById(String userId);

    void deleteUserById(String userId);

    List<UserRepresentation> getAllUsers();
    Integer getUsersCount();
}
