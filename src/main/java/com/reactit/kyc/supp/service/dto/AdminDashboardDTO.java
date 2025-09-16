package com.reactit.kyc.supp.service.dto;

import java.util.List;

public class AdminDashboardDTO {

    private List<CustomerDocumentCountDTO> customerDocumentCounts;
    private CustomerInfoDTO customerInfo;
    private MailStatsDTO mailStats;
    private Long countFaceMatch;

    private Integer totalUsers;

    public AdminDashboardDTO(List<CustomerDocumentCountDTO> customerDocumentCounts, CustomerInfoDTO customerInfo, MailStatsDTO mailStats, Long countFaceMatch, Integer totalUsers) {
        this.customerDocumentCounts = customerDocumentCounts;
        this.customerInfo = customerInfo;
        this.mailStats = mailStats;
        this.countFaceMatch = countFaceMatch;
        this.totalUsers = totalUsers;
    }

    public List<CustomerDocumentCountDTO> getCustomerDocumentCounts() {
        return customerDocumentCounts;
    }
    public CustomerInfoDTO getCustomerInfo() {
        return customerInfo;
    }

    public MailStatsDTO getMailStats() {
        return mailStats;
    }

    public Long getCountFaceMatch() {
        return countFaceMatch;
    }
    public Integer getTotalUsers() {
        return totalUsers;
    }
}
