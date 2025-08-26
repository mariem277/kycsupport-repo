package com.reactit.kyc.supp.repository;

import com.reactit.kyc.supp.domain.Regulation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Regulation entity.
 */
@Repository
public interface RegulationRepository extends JpaRepository<Regulation, Long> {
    Page<Regulation> findAll(Pageable pageable);
}
