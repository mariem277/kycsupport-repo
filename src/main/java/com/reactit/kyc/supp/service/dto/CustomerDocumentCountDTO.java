package com.reactit.kyc.supp.service.dto;

import com.reactit.kyc.supp.domain.enumeration.KycStatus;

public class CustomerDocumentCountDTO {


    private Long customerId;
    private String fullName;
    private KycStatus kycStatus;
    private Long documentCount;

    public CustomerDocumentCountDTO(Long customerId, String fullName, KycStatus kycStatus, Long documentCount) {
        this.customerId = customerId;
        this.fullName = fullName;
        this.kycStatus = kycStatus;
        this.documentCount = documentCount;
    }


    public String getFullName() {
        return fullName;
    }

    public Long getDocumentCount() {
        return documentCount;
    }
    public Long getCustomerId() {
        return customerId;
    }
    public KycStatus getKycStatus() {
        return kycStatus;
    }
}
