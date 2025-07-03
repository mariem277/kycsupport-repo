package com.reactit.kyc.supp.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.reactit.kyc.supp.domain.FaceMatch} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class FaceMatchDTO implements Serializable {

    private Long id;

    @NotNull
    private String selfieUrl;

    @NotNull
    private String idPhotoUrl;

    private Boolean match;

    private Double score;

    private Instant createdAt;

    private CustomerDTO customer;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSelfieUrl() {
        return selfieUrl;
    }

    public void setSelfieUrl(String selfieUrl) {
        this.selfieUrl = selfieUrl;
    }

    public String getIdPhotoUrl() {
        return idPhotoUrl;
    }

    public void setIdPhotoUrl(String idPhotoUrl) {
        this.idPhotoUrl = idPhotoUrl;
    }

    public Boolean getMatch() {
        return match;
    }

    public void setMatch(Boolean match) {
        this.match = match;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public CustomerDTO getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerDTO customer) {
        this.customer = customer;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FaceMatchDTO)) {
            return false;
        }

        FaceMatchDTO faceMatchDTO = (FaceMatchDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, faceMatchDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FaceMatchDTO{" +
            "id=" + getId() +
            ", selfieUrl='" + getSelfieUrl() + "'" +
            ", idPhotoUrl='" + getIdPhotoUrl() + "'" +
            ", match='" + getMatch() + "'" +
            ", score=" + getScore() +
            ", createdAt='" + getCreatedAt() + "'" +
            ", customer=" + getCustomer() +
            "}";
    }
}
