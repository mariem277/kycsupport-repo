package com.reactit.kyc.supp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.reactit.kyc.supp.domain.enumeration.KycStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * A Customer.
 */
@Entity
@Table(name = "customer")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Customer implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "address")
    private String address;

    @Column(name = "phone")
    private String phone;

    @Column(name = "id_number")
    private String idNumber;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status", nullable = false)
    private KycStatus kycStatus;

    @Column(name = "created_at")
    private Instant createdAt;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "customer")
    @JsonIgnoreProperties(value = { "customer" }, allowSetters = true)
    private Set<Document> documents = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "customer")
    @JsonIgnoreProperties(value = { "customer" }, allowSetters = true)
    private Set<FaceMatch> faceMatches = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "customers" }, allowSetters = true)
    private Partner partner;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Customer id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return this.fullName;
    }

    public Customer fullName(String fullName) {
        this.setFullName(fullName);
        return this;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getDob() {
        return this.dob;
    }

    public Customer dob(LocalDate dob) {
        this.setDob(dob);
        return this;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getAddress() {
        return this.address;
    }

    public Customer address(String address) {
        this.setAddress(address);
        return this;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return this.phone;
    }

    public Customer phone(String phone) {
        this.setPhone(phone);
        return this;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getIdNumber() {
        return this.idNumber;
    }

    public Customer idNumber(String idNumber) {
        this.setIdNumber(idNumber);
        return this;
    }

    public void setIdNumber(String idNumber) {
        this.idNumber = idNumber;
    }

    public KycStatus getKycStatus() {
        return this.kycStatus;
    }

    public Customer kycStatus(KycStatus kycStatus) {
        this.setKycStatus(kycStatus);
        return this;
    }

    public void setKycStatus(KycStatus kycStatus) {
        this.kycStatus = kycStatus;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Customer createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Set<Document> getDocuments() {
        return this.documents;
    }

    public void setDocuments(Set<Document> documents) {
        if (this.documents != null) {
            this.documents.forEach(i -> i.setCustomer(null));
        }
        if (documents != null) {
            documents.forEach(i -> i.setCustomer(this));
        }
        this.documents = documents;
    }

    public Customer documents(Set<Document> documents) {
        this.setDocuments(documents);
        return this;
    }

    public Customer addDocuments(Document document) {
        this.documents.add(document);
        document.setCustomer(this);
        return this;
    }

    public Customer removeDocuments(Document document) {
        this.documents.remove(document);
        document.setCustomer(null);
        return this;
    }

    public Set<FaceMatch> getFaceMatches() {
        return this.faceMatches;
    }

    public void setFaceMatches(Set<FaceMatch> faceMatches) {
        if (this.faceMatches != null) {
            this.faceMatches.forEach(i -> i.setCustomer(null));
        }
        if (faceMatches != null) {
            faceMatches.forEach(i -> i.setCustomer(this));
        }
        this.faceMatches = faceMatches;
    }

    public Customer faceMatches(Set<FaceMatch> faceMatches) {
        this.setFaceMatches(faceMatches);
        return this;
    }

    public Customer addFaceMatches(FaceMatch faceMatch) {
        this.faceMatches.add(faceMatch);
        faceMatch.setCustomer(this);
        return this;
    }

    public Customer removeFaceMatches(FaceMatch faceMatch) {
        this.faceMatches.remove(faceMatch);
        faceMatch.setCustomer(null);
        return this;
    }

    public Partner getPartner() {
        return this.partner;
    }

    public void setPartner(Partner partner) {
        this.partner = partner;
    }

    public Customer partner(Partner partner) {
        this.setPartner(partner);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Customer)) {
            return false;
        }
        return getId() != null && getId().equals(((Customer) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Customer{" +
            "id=" + getId() +
            ", fullName='" + getFullName() + "'" +
            ", dob='" + getDob() + "'" +
            ", address='" + getAddress() + "'" +
            ", phone='" + getPhone() + "'" +
            ", idNumber='" + getIdNumber() + "'" +
            ", kycStatus='" + getKycStatus() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}
