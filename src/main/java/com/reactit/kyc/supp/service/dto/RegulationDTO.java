package com.reactit.kyc.supp.service.dto;

import com.reactit.kyc.supp.domain.enumeration.RegulationStatus;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.reactit.kyc.supp.domain.Regulation} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RegulationDTO implements Serializable {

    private Long id;

    @NotNull
    private String title;

    private String content;

    private String sourceUrl;

    @NotNull
    private RegulationStatus status;

    private Instant createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public RegulationStatus getStatus() {
        return status;
    }

    public void setStatus(RegulationStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof RegulationDTO)) {
            return false;
        }

        RegulationDTO regulationDTO = (RegulationDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, regulationDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RegulationDTO{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", content='" + getContent() + "'" +
            ", sourceUrl='" + getSourceUrl() + "'" +
            ", status='" + getStatus() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}
