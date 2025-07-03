package com.reactit.kyc.supp.web.rest;

import com.reactit.kyc.supp.repository.PartnerRepository;
import com.reactit.kyc.supp.service.PartnerService;
import com.reactit.kyc.supp.service.dto.PartnerDTO;
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
 * REST controller for managing {@link com.reactit.kyc.supp.domain.Partner}.
 */
@RestController
@RequestMapping("/api/partners")
public class PartnerResource {

    private static final Logger LOG = LoggerFactory.getLogger(PartnerResource.class);

    private static final String ENTITY_NAME = "partner";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PartnerService partnerService;

    private final PartnerRepository partnerRepository;

    public PartnerResource(PartnerService partnerService, PartnerRepository partnerRepository) {
        this.partnerService = partnerService;
        this.partnerRepository = partnerRepository;
    }

    /**
     * {@code POST  /partners} : Create a new partner.
     *
     * @param partnerDTO the partnerDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new partnerDTO, or with status {@code 400 (Bad Request)} if the partner has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PartnerDTO> createPartner(@Valid @RequestBody PartnerDTO partnerDTO) throws URISyntaxException {
        LOG.debug("REST request to save Partner : {}", partnerDTO);
        if (partnerDTO.getId() != null) {
            throw new BadRequestAlertException("A new partner cannot already have an ID", ENTITY_NAME, "idexists");
        }
        partnerDTO = partnerService.save(partnerDTO);
        return ResponseEntity.created(new URI("/api/partners/" + partnerDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, partnerDTO.getId().toString()))
            .body(partnerDTO);
    }

    /**
     * {@code PUT  /partners/:id} : Updates an existing partner.
     *
     * @param id the id of the partnerDTO to save.
     * @param partnerDTO the partnerDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated partnerDTO,
     * or with status {@code 400 (Bad Request)} if the partnerDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the partnerDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PartnerDTO> updatePartner(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PartnerDTO partnerDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Partner : {}, {}", id, partnerDTO);
        if (partnerDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, partnerDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!partnerRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        partnerDTO = partnerService.update(partnerDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, partnerDTO.getId().toString()))
            .body(partnerDTO);
    }

    /**
     * {@code PATCH  /partners/:id} : Partial updates given fields of an existing partner, field will ignore if it is null
     *
     * @param id the id of the partnerDTO to save.
     * @param partnerDTO the partnerDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated partnerDTO,
     * or with status {@code 400 (Bad Request)} if the partnerDTO is not valid,
     * or with status {@code 404 (Not Found)} if the partnerDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the partnerDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PartnerDTO> partialUpdatePartner(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PartnerDTO partnerDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Partner partially : {}, {}", id, partnerDTO);
        if (partnerDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, partnerDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!partnerRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PartnerDTO> result = partnerService.partialUpdate(partnerDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, partnerDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /partners} : get all the partners.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of partners in body.
     */
    @GetMapping("")
    public ResponseEntity<List<PartnerDTO>> getAllPartners(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Partners");
        Page<PartnerDTO> page = partnerService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /partners/:id} : get the "id" partner.
     *
     * @param id the id of the partnerDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the partnerDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PartnerDTO> getPartner(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Partner : {}", id);
        Optional<PartnerDTO> partnerDTO = partnerService.findOne(id);
        return ResponseUtil.wrapOrNotFound(partnerDTO);
    }

    /**
     * {@code DELETE  /partners/:id} : delete the "id" partner.
     *
     * @param id the id of the partnerDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePartner(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Partner : {}", id);
        partnerService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
