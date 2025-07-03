package com.reactit.kyc.supp.service;

import com.reactit.kyc.supp.service.dto.FaceMatchDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.reactit.kyc.supp.domain.FaceMatch}.
 */
public interface FaceMatchService {
    /**
     * Save a faceMatch.
     *
     * @param faceMatchDTO the entity to save.
     * @return the persisted entity.
     */
    FaceMatchDTO save(FaceMatchDTO faceMatchDTO);

    /**
     * Updates a faceMatch.
     *
     * @param faceMatchDTO the entity to update.
     * @return the persisted entity.
     */
    FaceMatchDTO update(FaceMatchDTO faceMatchDTO);

    /**
     * Partially updates a faceMatch.
     *
     * @param faceMatchDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<FaceMatchDTO> partialUpdate(FaceMatchDTO faceMatchDTO);

    /**
     * Get all the faceMatches.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<FaceMatchDTO> findAll(Pageable pageable);

    /**
     * Get the "id" faceMatch.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<FaceMatchDTO> findOne(Long id);

    /**
     * Delete the "id" faceMatch.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
