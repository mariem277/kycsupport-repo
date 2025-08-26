package com.reactit.kyc.supp.web.rest;

import com.reactit.kyc.supp.repository.RegulationRepository;
import com.reactit.kyc.supp.service.RegulationService;
import com.reactit.kyc.supp.service.dto.RegulationDTO;
import com.reactit.kyc.supp.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.reactit.kyc.supp.domain.Regulation}.
 */
@RestController
@RequestMapping("/api/regulations")
public class RegulationResource {

    private static final Logger LOG = LoggerFactory.getLogger(RegulationResource.class);

    private static final String ENTITY_NAME = "regulation";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final RegulationService regulationService;

    private final RegulationRepository regulationRepository;

    public RegulationResource(RegulationService regulationService, RegulationRepository regulationRepository) {
        this.regulationService = regulationService;
        this.regulationRepository = regulationRepository;
    }

    /**
     * {@code POST  /regulations} : Create a new regulation.
     *
     * @param regulationDTO the regulationDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new regulationDTO, or with status {@code 400 (Bad Request)} if the regulation has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<RegulationDTO> createRegulation(@Valid @RequestBody RegulationDTO regulationDTO) throws URISyntaxException {
        LOG.debug("REST request to save Regulation : {}", regulationDTO);
        if (regulationDTO.getId() != null) {
            throw new BadRequestAlertException("A new regulation cannot already have an ID", ENTITY_NAME, "idexists");
        }
        regulationDTO = regulationService.save(regulationDTO);
        return ResponseEntity.created(new URI("/api/regulations/" + regulationDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, regulationDTO.getId().toString()))
            .body(regulationDTO);
    }

    /**
     * {@code PUT  /regulations/:id} : Updates an existing regulation.
     *
     * @param id the id of the regulationDTO to save.
     * @param regulationDTO the regulationDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated regulationDTO,
     * or with status {@code 400 (Bad Request)} if the regulationDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the regulationDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<RegulationDTO> updateRegulation(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody RegulationDTO regulationDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Regulation : {}, {}", id, regulationDTO);
        if (regulationDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, regulationDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!regulationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        regulationDTO = regulationService.update(regulationDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, regulationDTO.getId().toString()))
            .body(regulationDTO);
    }

    /**
     * {@code PATCH  /regulations/:id} : Partial updates given fields of an existing regulation, field will ignore if it is null
     *
     * @param id the id of the regulationDTO to save.
     * @param regulationDTO the regulationDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated regulationDTO,
     * or with status {@code 400 (Bad Request)} if the regulationDTO is not valid,
     * or with status {@code 404 (Not Found)} if the regulationDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the regulationDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<RegulationDTO> partialUpdateRegulation(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody RegulationDTO regulationDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Regulation partially : {}, {}", id, regulationDTO);
        if (regulationDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, regulationDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!regulationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<RegulationDTO> result = regulationService.partialUpdate(regulationDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, regulationDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /regulations} : get all the regulations.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of regulations in body.
     */
    @GetMapping("")
    public ResponseEntity<List<RegulationDTO>> getAllRegulations(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Regulations");
        Page<RegulationDTO> page = regulationService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /regulations/:id} : get the "id" regulation.
     *
     * @param id the id of the regulationDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the regulationDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RegulationDTO> getRegulation(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Regulation : {}", id);
        Optional<RegulationDTO> regulationDTO = regulationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(regulationDTO);
    }

    /**
     * {@code DELETE  /regulations/:id} : delete the "id" regulation.
     *
     * @param id the id of the regulationDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegulation(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Regulation : {}", id);
        regulationService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @PostMapping("/{id}/notify")
    public ResponseEntity<Void> notifyCustomers(@PathVariable Long id) {
        regulationService.notifyCustomers(id);
        return ResponseEntity.ok().build();
    }
}
