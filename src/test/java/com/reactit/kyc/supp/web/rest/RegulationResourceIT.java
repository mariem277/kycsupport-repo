package com.reactit.kyc.supp.web.rest;

import static com.reactit.kyc.supp.domain.RegulationAsserts.*;
import static com.reactit.kyc.supp.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reactit.kyc.supp.IntegrationTest;
import com.reactit.kyc.supp.domain.Regulation;
import com.reactit.kyc.supp.domain.enumeration.RegulationStatus;
import com.reactit.kyc.supp.repository.RegulationRepository;
import com.reactit.kyc.supp.service.dto.RegulationDTO;
import com.reactit.kyc.supp.service.mapper.RegulationMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link RegulationResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class RegulationResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_CONTENT = "AAAAAAAAAA";
    private static final String UPDATED_CONTENT = "BBBBBBBBBB";

    private static final String DEFAULT_SOURCE_URL = "AAAAAAAAAA";
    private static final String UPDATED_SOURCE_URL = "BBBBBBBBBB";

    private static final RegulationStatus DEFAULT_STATUS = RegulationStatus.PENDING;
    private static final RegulationStatus UPDATED_STATUS = RegulationStatus.REVIEWED;

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/regulations";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private RegulationRepository regulationRepository;

    @Autowired
    private RegulationMapper regulationMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restRegulationMockMvc;

    private Regulation regulation;

    private Regulation insertedRegulation;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Regulation createEntity() {
        return new Regulation()
            .title(DEFAULT_TITLE)
            .content(DEFAULT_CONTENT)
            .sourceUrl(DEFAULT_SOURCE_URL)
            .status(DEFAULT_STATUS)
            .createdAt(DEFAULT_CREATED_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Regulation createUpdatedEntity() {
        return new Regulation()
            .title(UPDATED_TITLE)
            .content(UPDATED_CONTENT)
            .sourceUrl(UPDATED_SOURCE_URL)
            .status(UPDATED_STATUS)
            .createdAt(UPDATED_CREATED_AT);
    }

    @BeforeEach
    void initTest() {
        regulation = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedRegulation != null) {
            regulationRepository.delete(insertedRegulation);
            insertedRegulation = null;
        }
    }

    @Test
    @Transactional
    void createRegulation() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Regulation
        RegulationDTO regulationDTO = regulationMapper.toDto(regulation);
        var returnedRegulationDTO = om.readValue(
            restRegulationMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(regulationDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            RegulationDTO.class
        );

        // Validate the Regulation in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedRegulation = regulationMapper.toEntity(returnedRegulationDTO);
        assertRegulationUpdatableFieldsEquals(returnedRegulation, getPersistedRegulation(returnedRegulation));

        insertedRegulation = returnedRegulation;
    }

    @Test
    @Transactional
    void createRegulationWithExistingId() throws Exception {
        // Create the Regulation with an existing ID
        regulation.setId(1L);
        RegulationDTO regulationDTO = regulationMapper.toDto(regulation);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restRegulationMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(regulationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Regulation in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        regulation.setTitle(null);

        // Create the Regulation, which fails.
        RegulationDTO regulationDTO = regulationMapper.toDto(regulation);

        restRegulationMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(regulationDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        regulation.setStatus(null);

        // Create the Regulation, which fails.
        RegulationDTO regulationDTO = regulationMapper.toDto(regulation);

        restRegulationMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(regulationDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllRegulations() throws Exception {
        // Initialize the database
        insertedRegulation = regulationRepository.saveAndFlush(regulation);

        // Get all the regulationList
        restRegulationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(regulation.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT)))
            .andExpect(jsonPath("$.[*].sourceUrl").value(hasItem(DEFAULT_SOURCE_URL)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())));
    }

    @Test
    @Transactional
    void getRegulation() throws Exception {
        // Initialize the database
        insertedRegulation = regulationRepository.saveAndFlush(regulation);

        // Get the regulation
        restRegulationMockMvc
            .perform(get(ENTITY_API_URL_ID, regulation.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(regulation.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.content").value(DEFAULT_CONTENT))
            .andExpect(jsonPath("$.sourceUrl").value(DEFAULT_SOURCE_URL))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingRegulation() throws Exception {
        // Get the regulation
        restRegulationMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingRegulation() throws Exception {
        // Initialize the database
        insertedRegulation = regulationRepository.saveAndFlush(regulation);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the regulation
        Regulation updatedRegulation = regulationRepository.findById(regulation.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedRegulation are not directly saved in db
        em.detach(updatedRegulation);
        updatedRegulation
            .title(UPDATED_TITLE)
            .content(UPDATED_CONTENT)
            .sourceUrl(UPDATED_SOURCE_URL)
            .status(UPDATED_STATUS)
            .createdAt(UPDATED_CREATED_AT);
        RegulationDTO regulationDTO = regulationMapper.toDto(updatedRegulation);

        restRegulationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, regulationDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(regulationDTO))
            )
            .andExpect(status().isOk());

        // Validate the Regulation in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedRegulationToMatchAllProperties(updatedRegulation);
    }

    @Test
    @Transactional
    void putNonExistingRegulation() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        regulation.setId(longCount.incrementAndGet());

        // Create the Regulation
        RegulationDTO regulationDTO = regulationMapper.toDto(regulation);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRegulationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, regulationDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(regulationDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Regulation in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchRegulation() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        regulation.setId(longCount.incrementAndGet());

        // Create the Regulation
        RegulationDTO regulationDTO = regulationMapper.toDto(regulation);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRegulationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(regulationDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Regulation in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamRegulation() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        regulation.setId(longCount.incrementAndGet());

        // Create the Regulation
        RegulationDTO regulationDTO = regulationMapper.toDto(regulation);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRegulationMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(regulationDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Regulation in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateRegulationWithPatch() throws Exception {
        // Initialize the database
        insertedRegulation = regulationRepository.saveAndFlush(regulation);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the regulation using partial update
        Regulation partialUpdatedRegulation = new Regulation();
        partialUpdatedRegulation.setId(regulation.getId());

        partialUpdatedRegulation
            .title(UPDATED_TITLE)
            .content(UPDATED_CONTENT)
            .sourceUrl(UPDATED_SOURCE_URL)
            .status(UPDATED_STATUS)
            .createdAt(UPDATED_CREATED_AT);

        restRegulationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRegulation.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRegulation))
            )
            .andExpect(status().isOk());

        // Validate the Regulation in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRegulationUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedRegulation, regulation),
            getPersistedRegulation(regulation)
        );
    }

    @Test
    @Transactional
    void fullUpdateRegulationWithPatch() throws Exception {
        // Initialize the database
        insertedRegulation = regulationRepository.saveAndFlush(regulation);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the regulation using partial update
        Regulation partialUpdatedRegulation = new Regulation();
        partialUpdatedRegulation.setId(regulation.getId());

        partialUpdatedRegulation
            .title(UPDATED_TITLE)
            .content(UPDATED_CONTENT)
            .sourceUrl(UPDATED_SOURCE_URL)
            .status(UPDATED_STATUS)
            .createdAt(UPDATED_CREATED_AT);

        restRegulationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRegulation.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRegulation))
            )
            .andExpect(status().isOk());

        // Validate the Regulation in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRegulationUpdatableFieldsEquals(partialUpdatedRegulation, getPersistedRegulation(partialUpdatedRegulation));
    }

    @Test
    @Transactional
    void patchNonExistingRegulation() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        regulation.setId(longCount.incrementAndGet());

        // Create the Regulation
        RegulationDTO regulationDTO = regulationMapper.toDto(regulation);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRegulationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, regulationDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(regulationDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Regulation in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchRegulation() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        regulation.setId(longCount.incrementAndGet());

        // Create the Regulation
        RegulationDTO regulationDTO = regulationMapper.toDto(regulation);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRegulationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(regulationDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Regulation in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamRegulation() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        regulation.setId(longCount.incrementAndGet());

        // Create the Regulation
        RegulationDTO regulationDTO = regulationMapper.toDto(regulation);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRegulationMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(regulationDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Regulation in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteRegulation() throws Exception {
        // Initialize the database
        insertedRegulation = regulationRepository.saveAndFlush(regulation);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the regulation
        restRegulationMockMvc
            .perform(delete(ENTITY_API_URL_ID, regulation.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return regulationRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Regulation getPersistedRegulation(Regulation regulation) {
        return regulationRepository.findById(regulation.getId()).orElseThrow();
    }

    protected void assertPersistedRegulationToMatchAllProperties(Regulation expectedRegulation) {
        assertRegulationAllPropertiesEquals(expectedRegulation, getPersistedRegulation(expectedRegulation));
    }

    protected void assertPersistedRegulationToMatchUpdatableProperties(Regulation expectedRegulation) {
        assertRegulationAllUpdatablePropertiesEquals(expectedRegulation, getPersistedRegulation(expectedRegulation));
    }
}
