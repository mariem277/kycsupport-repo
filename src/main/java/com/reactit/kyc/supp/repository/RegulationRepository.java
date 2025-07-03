package com.reactit.kyc.supp.repository;

import com.reactit.kyc.supp.domain.Regulation;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Regulation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RegulationRepository extends JpaRepository<Regulation, Long> {}
