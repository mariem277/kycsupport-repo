package com.reactit.kyc.supp.web.rest;

import com.reactit.kyc.supp.service.KeycloakUserService;
import com.reactit.kyc.supp.service.dto.UserRegistrationRecord;
import java.security.Principal;
import java.util.List;
import lombok.AllArgsConstructor;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminKeycloakUserResource {

    private final KeycloakUserService keycloakUserService;

    public AdminKeycloakUserResource(KeycloakUserService keycloakUserService) {
        this.keycloakUserService = keycloakUserService;
    }

    @PostMapping
    public UserRegistrationRecord createUser(@RequestBody UserRegistrationRecord userRegistrationRecord) {
        return keycloakUserService.createUser(userRegistrationRecord);
    }

    @GetMapping
    public UserRepresentation getUser(Principal principal) {
        return keycloakUserService.getUserById(principal.getName());
    }

    @GetMapping("/all")
    public List<UserRepresentation> getAllUsers() {
        return keycloakUserService.getAllUsers();
    }

    @DeleteMapping("/{userId}")
    public void deleteUserById(@PathVariable String userId) {
        keycloakUserService.deleteUserById(userId);
    }
}
