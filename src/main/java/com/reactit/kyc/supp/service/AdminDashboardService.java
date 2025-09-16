package com.reactit.kyc.supp.service;

import com.reactit.kyc.supp.repository.CustomerRepository;
import com.reactit.kyc.supp.repository.FaceMatchRepository;
import com.reactit.kyc.supp.repository.NotificationLogRepository;
import com.reactit.kyc.supp.service.dto.AdminDashboardDTO;
import com.reactit.kyc.supp.service.dto.CustomerDocumentCountDTO;
import com.reactit.kyc.supp.service.dto.CustomerInfoDTO;
import com.reactit.kyc.supp.service.dto.MailStatsDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminDashboardService {

    private final CustomerRepository customerRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final FaceMatchRepository faceMatchRepository;

    private final KeycloakUserService keycloakUserService;

    public AdminDashboardService(CustomerRepository customerRepository, NotificationLogRepository notificationLogRepository, FaceMatchRepository faceMatchRepository, KeycloakUserService keycloakUserService) {
        this.customerRepository = customerRepository;
        this.notificationLogRepository = notificationLogRepository;
        this.faceMatchRepository=faceMatchRepository;
        this.keycloakUserService = keycloakUserService;
    }

    public AdminDashboardDTO getDashboardData() {
        // part 1: customer + document counts
        List<CustomerDocumentCountDTO> customerDocs = customerRepository.findCustomersWithDocumentCount();

        // part 2: stats
        Long total = customerRepository.countTotalCustomers();
        Long pending = customerRepository.countPendingCustomers();
        Long verified = customerRepository.countVerifiedCustomers();
        Long rejected = customerRepository.countRejectedCustomers();
        Long customersAddedThisMonth= customerRepository.countCustomersAddedThisMonth();

        Long countFaceMatch=faceMatchRepository.countAllBy();

        Integer totalUsers = keycloakUserService.getUsersCount();

        CustomerInfoDTO customerInfo = new CustomerInfoDTO(total, pending, verified, rejected, customersAddedThisMonth);

        int totalEmailsSent = notificationLogRepository.totalEmailsSent();
        MailStatsDTO mailStats = new MailStatsDTO(totalEmailsSent);

        return new AdminDashboardDTO(customerDocs, customerInfo,mailStats,countFaceMatch,totalUsers);
    }
}
