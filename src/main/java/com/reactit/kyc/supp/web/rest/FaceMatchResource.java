package com.reactit.kyc.supp.web.rest;

import com.reactit.kyc.supp.repository.FaceMatchRepository;
import com.reactit.kyc.supp.service.FaceMatchService;
import com.reactit.kyc.supp.service.dto.FaceMatchDTO;
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
 * REST controller for managing {@link com.reactit.kyc.supp.domain.FaceMatch}.
 */
@RestController
@RequestMapping("/api/face-matches")
public class FaceMatchResource {

    private static final Logger LOG = LoggerFactory.getLogger(FaceMatchResource.class);

    private static final String ENTITY_NAME = "faceMatch";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FaceMatchService faceMatchService;

    private final FaceMatchRepository faceMatchRepository;

    public FaceMatchResource(FaceMatchService faceMatchService, FaceMatchRepository faceMatchRepository) {
        this.faceMatchService = faceMatchService;
        this.faceMatchRepository = faceMatchRepository;
    }

    /**
     * {@code POST  /face-matches} : Create a new faceMatch.
     *
     * @param faceMatchDTO the faceMatchDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new faceMatchDTO, or with status {@code 400 (Bad Request)} if the faceMatch has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<FaceMatchDTO> createFaceMatch(@Valid @RequestBody FaceMatchDTO faceMatchDTO) throws URISyntaxException {
        LOG.debug("REST request to save FaceMatch : {}", faceMatchDTO);
        if (faceMatchDTO.getId() != null) {
            throw new BadRequestAlertException("A new faceMatch cannot already have an ID", ENTITY_NAME, "idexists");
        }
        faceMatchDTO = faceMatchService.save(faceMatchDTO);
        return ResponseEntity.created(new URI("/api/face-matches/" + faceMatchDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, faceMatchDTO.getId().toString()))
            .body(faceMatchDTO);
    }

    /**
     * {@code PUT  /face-matches/:id} : Updates an existing faceMatch.
     *
     * @param id the id of the faceMatchDTO to save.
     * @param faceMatchDTO the faceMatchDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated faceMatchDTO,
     * or with status {@code 400 (Bad Request)} if the faceMatchDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the faceMatchDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<FaceMatchDTO> updateFaceMatch(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody FaceMatchDTO faceMatchDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update FaceMatch : {}, {}", id, faceMatchDTO);
        if (faceMatchDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, faceMatchDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!faceMatchRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        faceMatchDTO = faceMatchService.update(faceMatchDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, faceMatchDTO.getId().toString()))
            .body(faceMatchDTO);
    }

    /**
     * {@code PATCH  /face-matches/:id} : Partial updates given fields of an existing faceMatch, field will ignore if it is null
     *
     * @param id the id of the faceMatchDTO to save.
     * @param faceMatchDTO the faceMatchDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated faceMatchDTO,
     * or with status {@code 400 (Bad Request)} if the faceMatchDTO is not valid,
     * or with status {@code 404 (Not Found)} if the faceMatchDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the faceMatchDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<FaceMatchDTO> partialUpdateFaceMatch(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody FaceMatchDTO faceMatchDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update FaceMatch partially : {}, {}", id, faceMatchDTO);
        if (faceMatchDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, faceMatchDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!faceMatchRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<FaceMatchDTO> result = faceMatchService.partialUpdate(faceMatchDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, faceMatchDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /face-matches} : get all the faceMatches.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of faceMatches in body.
     */
    @GetMapping("")
    public ResponseEntity<List<FaceMatchDTO>> getAllFaceMatches(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of FaceMatches");
        Page<FaceMatchDTO> page = faceMatchService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /face-matches/:id} : get the "id" faceMatch.
     *
     * @param id the id of the faceMatchDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the faceMatchDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<FaceMatchDTO> getFaceMatch(@PathVariable("id") Long id) {
        LOG.debug("REST request to get FaceMatch : {}", id);
        Optional<FaceMatchDTO> faceMatchDTO = faceMatchService.findOne(id);
        return ResponseUtil.wrapOrNotFound(faceMatchDTO);
    }

    /**
     * {@code DELETE  /face-matches/:id} : delete the "id" faceMatch.
     *
     * @param id the id of the faceMatchDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaceMatch(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete FaceMatch : {}", id);
        faceMatchService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
