package com.reactit.kyc.supp.repository;
import com.reactit.kyc.supp.service.dto.CustomerDocumentCountDTO;
import com.reactit.kyc.supp.domain.Customer;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for the Customer entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // Customers with document count
    @Query("SELECT new com.reactit.kyc.supp.service.dto.CustomerDocumentCountDTO(c.id, c.fullName, c.kycStatus, COUNT(d)) " +
        "FROM Customer c LEFT JOIN Document d ON d.customer.id = c.id " +
        "GROUP BY c.id, c.fullName, c.kycStatus")
    List<CustomerDocumentCountDTO> findCustomersWithDocumentCount();

    // Total customers
    @Query("SELECT COUNT(c) FROM Customer c")
    Long countTotalCustomers();

    // Pending customers
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.kycStatus = 'PENDING'")
    Long countPendingCustomers();

    // Verified customers
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.kycStatus = 'VERIFIED'")
    Long countVerifiedCustomers();

    // Rejected customers
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.kycStatus = 'REJECTED'")
    Long countRejectedCustomers();

    @Query("SELECT COUNT(c) FROM Customer c WHERE MONTH(c.createdAt) = MONTH(CURRENT_DATE) AND YEAR(c.createdAt) = YEAR(CURRENT_DATE)")
    Long countCustomersAddedThisMonth();
}
