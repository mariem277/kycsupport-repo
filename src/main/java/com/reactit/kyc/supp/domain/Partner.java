package com.reactit.kyc.supp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A Partner.
 */
@Entity
@Table(name = "partner")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Partner implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Column(name = "realm_name", nullable = false)
    private String realmName;

    @NotNull
    @Column(name = "client_id", nullable = false)
    private String clientId;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "partner")
    @JsonIgnoreProperties(value = { "documents", "faceMatches", "partner" }, allowSetters = true)
    private Set<Customer> customers = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Partner id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Partner name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRealmName() {
        return this.realmName;
    }

    public Partner realmName(String realmName) {
        this.setRealmName(realmName);
        return this;
    }

    public void setRealmName(String realmName) {
        this.realmName = realmName;
    }

    public String getClientId() {
        return this.clientId;
    }

    public Partner clientId(String clientId) {
        this.setClientId(clientId);
        return this;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public Set<Customer> getCustomers() {
        return this.customers;
    }

    public void setCustomers(Set<Customer> customers) {
        if (this.customers != null) {
            this.customers.forEach(i -> i.setPartner(null));
        }
        if (customers != null) {
            customers.forEach(i -> i.setPartner(this));
        }
        this.customers = customers;
    }

    public Partner customers(Set<Customer> customers) {
        this.setCustomers(customers);
        return this;
    }

    public Partner addCustomers(Customer customer) {
        this.customers.add(customer);
        customer.setPartner(this);
        return this;
    }

    public Partner removeCustomers(Customer customer) {
        this.customers.remove(customer);
        customer.setPartner(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Partner)) {
            return false;
        }
        return getId() != null && getId().equals(((Partner) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Partner{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", realmName='" + getRealmName() + "'" +
            ", clientId='" + getClientId() + "'" +
            "}";
    }
}
