package com.reactit.kyc.supp.repository;

import com.reactit.kyc.supp.domain.FaceMatch;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the FaceMatch entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FaceMatchRepository extends JpaRepository<FaceMatch, Long> {}
