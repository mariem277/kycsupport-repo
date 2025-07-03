package com.reactit.kyc.supp.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.reactit.kyc.supp.domain.Partner} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PartnerDTO implements Serializable {

    private Long id;

    @NotNull
    private String name;

    @NotNull
    private String realmName;

    @NotNull
    private String clientId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRealmName() {
        return realmName;
    }

    public void setRealmName(String realmName) {
        this.realmName = realmName;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PartnerDTO)) {
            return false;
        }

        PartnerDTO partnerDTO = (PartnerDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, partnerDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PartnerDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", realmName='" + getRealmName() + "'" +
            ", clientId='" + getClientId() + "'" +
            "}";
    }
}
