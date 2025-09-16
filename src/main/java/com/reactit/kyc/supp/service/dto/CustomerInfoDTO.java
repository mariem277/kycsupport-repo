package com.reactit.kyc.supp.service.dto;

public class CustomerInfoDTO {


    private Long totalCustomers;
    private Long pendingCustomers;
    private Long verifiedCustomers;
    private Long rejectedCustomers;


    private Long customersAddedThisMonth;

    public CustomerInfoDTO(Long totalCustomers, Long pendingCustomers, Long verifiedCustomers, Long rejectedCustomers, Long customersAddedThisMonth) {
        this.totalCustomers = totalCustomers;
        this.pendingCustomers = pendingCustomers;
        this.verifiedCustomers = verifiedCustomers;
        this.rejectedCustomers = rejectedCustomers;
        this.customersAddedThisMonth = customersAddedThisMonth;
    }


    public Long getRejectedCustomers() {
        return rejectedCustomers;
    }
    public Long getTotalCustomers() {
        return totalCustomers;
    }
    public Long getPendingCustomers() {
        return pendingCustomers;
    }
    public Long getVerifiedCustomers() {
        return verifiedCustomers;
    }
    public Long getCustomersAddedThisMonth() {
        return customersAddedThisMonth;
    }
}
