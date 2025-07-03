package com.reactit.kyc.supp.service;

import com.reactit.kyc.supp.service.dto.RegulationDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.reactit.kyc.supp.domain.Regulation}.
 */
public interface RegulationService {
    /**
     * Save a regulation.
     *
     * @param regulationDTO the entity to save.
     * @return the persisted entity.
     */
    RegulationDTO save(RegulationDTO regulationDTO);

    /**
     * Updates a regulation.
     *
     * @param regulationDTO the entity to update.
     * @return the persisted entity.
     */
    RegulationDTO update(RegulationDTO regulationDTO);

    /**
     * Partially updates a regulation.
     *
     * @param regulationDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<RegulationDTO> partialUpdate(RegulationDTO regulationDTO);

    /**
     * Get all the regulations.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<RegulationDTO> findAll(Pageable pageable);

    /**
     * Get the "id" regulation.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<RegulationDTO> findOne(Long id);

    /**
     * Delete the "id" regulation.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
