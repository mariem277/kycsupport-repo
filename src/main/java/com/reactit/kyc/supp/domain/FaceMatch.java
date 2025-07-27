package com.reactit.kyc.supp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;

/**
 * A FaceMatch.
 */
@Entity
@Table(name = "face_match")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class FaceMatch implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "selfie_url", nullable = false, length = 2048)
    private String selfieUrl;

    @NotNull
    @Column(name = "id_photo_url", nullable = false, length = 2048)
    private String idPhotoUrl;

    @Column(name = "match")
    private Boolean match;

    @Column(name = "score")
    private Double score;

    @Column(name = "created_at")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "documents", "faceMatches", "partner" }, allowSetters = true)
    private Customer customer;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public FaceMatch id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSelfieUrl() {
        return this.selfieUrl;
    }

    public FaceMatch selfieUrl(String selfieUrl) {
        this.setSelfieUrl(selfieUrl);
        return this;
    }

    public void setSelfieUrl(String selfieUrl) {
        this.selfieUrl = selfieUrl;
    }

    public String getIdPhotoUrl() {
        return this.idPhotoUrl;
    }

    public FaceMatch idPhotoUrl(String idPhotoUrl) {
        this.setIdPhotoUrl(idPhotoUrl);
        return this;
    }

    public void setIdPhotoUrl(String idPhotoUrl) {
        this.idPhotoUrl = idPhotoUrl;
    }

    public Boolean getMatch() {
        return this.match;
    }

    public FaceMatch match(Boolean match) {
        this.setMatch(match);
        return this;
    }

    public void setMatch(Boolean match) {
        this.match = match;
    }

    public Double getScore() {
        return this.score;
    }

    public FaceMatch score(Double score) {
        this.setScore(score);
        return this;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public FaceMatch createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Customer getCustomer() {
        return this.customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public FaceMatch customer(Customer customer) {
        this.setCustomer(customer);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FaceMatch)) {
            return false;
        }
        return getId() != null && getId().equals(((FaceMatch) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FaceMatch{" +
            "id=" + getId() +
            ", selfieUrl='" + getSelfieUrl() + "'" +
            ", idPhotoUrl='" + getIdPhotoUrl() + "'" +
            ", match='" + getMatch() + "'" +
            ", score=" + getScore() +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}
