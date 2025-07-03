package com.reactit.kyc.supp.repository;

import com.reactit.kyc.supp.domain.Partner;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Partner entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PartnerRepository extends JpaRepository<Partner, Long> {}
