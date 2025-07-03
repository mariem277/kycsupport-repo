package com.reactit.kyc.supp.web.rest;

import static com.reactit.kyc.supp.domain.FaceMatchAsserts.*;
import static com.reactit.kyc.supp.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reactit.kyc.supp.IntegrationTest;
import com.reactit.kyc.supp.domain.FaceMatch;
import com.reactit.kyc.supp.repository.FaceMatchRepository;
import com.reactit.kyc.supp.service.dto.FaceMatchDTO;
import com.reactit.kyc.supp.service.mapper.FaceMatchMapper;
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
 * Integration tests for the {@link FaceMatchResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class FaceMatchResourceIT {

    private static final String DEFAULT_SELFIE_URL = "AAAAAAAAAA";
    private static final String UPDATED_SELFIE_URL = "BBBBBBBBBB";

    private static final String DEFAULT_ID_PHOTO_URL = "AAAAAAAAAA";
    private static final String UPDATED_ID_PHOTO_URL = "BBBBBBBBBB";

    private static final Boolean DEFAULT_MATCH = false;
    private static final Boolean UPDATED_MATCH = true;

    private static final Double DEFAULT_SCORE = 1D;
    private static final Double UPDATED_SCORE = 2D;

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/face-matches";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private FaceMatchRepository faceMatchRepository;

    @Autowired
    private FaceMatchMapper faceMatchMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restFaceMatchMockMvc;

    private FaceMatch faceMatch;

    private FaceMatch insertedFaceMatch;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FaceMatch createEntity() {
        return new FaceMatch()
            .selfieUrl(DEFAULT_SELFIE_URL)
            .idPhotoUrl(DEFAULT_ID_PHOTO_URL)
            .match(DEFAULT_MATCH)
            .score(DEFAULT_SCORE)
            .createdAt(DEFAULT_CREATED_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FaceMatch createUpdatedEntity() {
        return new FaceMatch()
            .selfieUrl(UPDATED_SELFIE_URL)
            .idPhotoUrl(UPDATED_ID_PHOTO_URL)
            .match(UPDATED_MATCH)
            .score(UPDATED_SCORE)
            .createdAt(UPDATED_CREATED_AT);
    }

    @BeforeEach
    void initTest() {
        faceMatch = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedFaceMatch != null) {
            faceMatchRepository.delete(insertedFaceMatch);
            insertedFaceMatch = null;
        }
    }

    @Test
    @Transactional
    void createFaceMatch() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the FaceMatch
        FaceMatchDTO faceMatchDTO = faceMatchMapper.toDto(faceMatch);
        var returnedFaceMatchDTO = om.readValue(
            restFaceMatchMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(faceMatchDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            FaceMatchDTO.class
        );

        // Validate the FaceMatch in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedFaceMatch = faceMatchMapper.toEntity(returnedFaceMatchDTO);
        assertFaceMatchUpdatableFieldsEquals(returnedFaceMatch, getPersistedFaceMatch(returnedFaceMatch));

        insertedFaceMatch = returnedFaceMatch;
    }

    @Test
    @Transactional
    void createFaceMatchWithExistingId() throws Exception {
        // Create the FaceMatch with an existing ID
        faceMatch.setId(1L);
        FaceMatchDTO faceMatchDTO = faceMatchMapper.toDto(faceMatch);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restFaceMatchMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(faceMatchDTO)))
            .andExpect(status().isBadRequest());

        // Validate the FaceMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkSelfieUrlIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        faceMatch.setSelfieUrl(null);

        // Create the FaceMatch, which fails.
        FaceMatchDTO faceMatchDTO = faceMatchMapper.toDto(faceMatch);

        restFaceMatchMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(faceMatchDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIdPhotoUrlIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        faceMatch.setIdPhotoUrl(null);

        // Create the FaceMatch, which fails.
        FaceMatchDTO faceMatchDTO = faceMatchMapper.toDto(faceMatch);

        restFaceMatchMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(faceMatchDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllFaceMatches() throws Exception {
        // Initialize the database
        insertedFaceMatch = faceMatchRepository.saveAndFlush(faceMatch);

        // Get all the faceMatchList
        restFaceMatchMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(faceMatch.getId().intValue())))
            .andExpect(jsonPath("$.[*].selfieUrl").value(hasItem(DEFAULT_SELFIE_URL)))
            .andExpect(jsonPath("$.[*].idPhotoUrl").value(hasItem(DEFAULT_ID_PHOTO_URL)))
            .andExpect(jsonPath("$.[*].match").value(hasItem(DEFAULT_MATCH)))
            .andExpect(jsonPath("$.[*].score").value(hasItem(DEFAULT_SCORE)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())));
    }

    @Test
    @Transactional
    void getFaceMatch() throws Exception {
        // Initialize the database
        insertedFaceMatch = faceMatchRepository.saveAndFlush(faceMatch);

        // Get the faceMatch
        restFaceMatchMockMvc
            .perform(get(ENTITY_API_URL_ID, faceMatch.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(faceMatch.getId().intValue()))
            .andExpect(jsonPath("$.selfieUrl").value(DEFAULT_SELFIE_URL))
            .andExpect(jsonPath("$.idPhotoUrl").value(DEFAULT_ID_PHOTO_URL))
            .andExpect(jsonPath("$.match").value(DEFAULT_MATCH))
            .andExpect(jsonPath("$.score").value(DEFAULT_SCORE))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingFaceMatch() throws Exception {
        // Get the faceMatch
        restFaceMatchMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingFaceMatch() throws Exception {
        // Initialize the database
        insertedFaceMatch = faceMatchRepository.saveAndFlush(faceMatch);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the faceMatch
        FaceMatch updatedFaceMatch = faceMatchRepository.findById(faceMatch.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedFaceMatch are not directly saved in db
        em.detach(updatedFaceMatch);
        updatedFaceMatch
            .selfieUrl(UPDATED_SELFIE_URL)
            .idPhotoUrl(UPDATED_ID_PHOTO_URL)
            .match(UPDATED_MATCH)
            .score(UPDATED_SCORE)
            .createdAt(UPDATED_CREATED_AT);
        FaceMatchDTO faceMatchDTO = faceMatchMapper.toDto(updatedFaceMatch);

        restFaceMatchMockMvc
            .perform(
                put(ENTITY_API_URL_ID, faceMatchDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(faceMatchDTO))
            )
            .andExpect(status().isOk());

        // Validate the FaceMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedFaceMatchToMatchAllProperties(updatedFaceMatch);
    }

    @Test
    @Transactional
    void putNonExistingFaceMatch() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        faceMatch.setId(longCount.incrementAndGet());

        // Create the FaceMatch
        FaceMatchDTO faceMatchDTO = faceMatchMapper.toDto(faceMatch);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFaceMatchMockMvc
            .perform(
                put(ENTITY_API_URL_ID, faceMatchDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(faceMatchDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FaceMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchFaceMatch() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        faceMatch.setId(longCount.incrementAndGet());

        // Create the FaceMatch
        FaceMatchDTO faceMatchDTO = faceMatchMapper.toDto(faceMatch);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFaceMatchMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(faceMatchDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FaceMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamFaceMatch() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        faceMatch.setId(longCount.incrementAndGet());

        // Create the FaceMatch
        FaceMatchDTO faceMatchDTO = faceMatchMapper.toDto(faceMatch);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFaceMatchMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(faceMatchDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the FaceMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateFaceMatchWithPatch() throws Exception {
        // Initialize the database
        insertedFaceMatch = faceMatchRepository.saveAndFlush(faceMatch);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the faceMatch using partial update
        FaceMatch partialUpdatedFaceMatch = new FaceMatch();
        partialUpdatedFaceMatch.setId(faceMatch.getId());

        partialUpdatedFaceMatch.selfieUrl(UPDATED_SELFIE_URL).match(UPDATED_MATCH).score(UPDATED_SCORE);

        restFaceMatchMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFaceMatch.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFaceMatch))
            )
            .andExpect(status().isOk());

        // Validate the FaceMatch in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFaceMatchUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedFaceMatch, faceMatch),
            getPersistedFaceMatch(faceMatch)
        );
    }

    @Test
    @Transactional
    void fullUpdateFaceMatchWithPatch() throws Exception {
        // Initialize the database
        insertedFaceMatch = faceMatchRepository.saveAndFlush(faceMatch);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the faceMatch using partial update
        FaceMatch partialUpdatedFaceMatch = new FaceMatch();
        partialUpdatedFaceMatch.setId(faceMatch.getId());

        partialUpdatedFaceMatch
            .selfieUrl(UPDATED_SELFIE_URL)
            .idPhotoUrl(UPDATED_ID_PHOTO_URL)
            .match(UPDATED_MATCH)
            .score(UPDATED_SCORE)
            .createdAt(UPDATED_CREATED_AT);

        restFaceMatchMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFaceMatch.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFaceMatch))
            )
            .andExpect(status().isOk());

        // Validate the FaceMatch in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFaceMatchUpdatableFieldsEquals(partialUpdatedFaceMatch, getPersistedFaceMatch(partialUpdatedFaceMatch));
    }

    @Test
    @Transactional
    void patchNonExistingFaceMatch() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        faceMatch.setId(longCount.incrementAndGet());

        // Create the FaceMatch
        FaceMatchDTO faceMatchDTO = faceMatchMapper.toDto(faceMatch);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFaceMatchMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, faceMatchDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(faceMatchDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FaceMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchFaceMatch() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        faceMatch.setId(longCount.incrementAndGet());

        // Create the FaceMatch
        FaceMatchDTO faceMatchDTO = faceMatchMapper.toDto(faceMatch);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFaceMatchMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(faceMatchDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FaceMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamFaceMatch() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        faceMatch.setId(longCount.incrementAndGet());

        // Create the FaceMatch
        FaceMatchDTO faceMatchDTO = faceMatchMapper.toDto(faceMatch);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFaceMatchMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(faceMatchDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the FaceMatch in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteFaceMatch() throws Exception {
        // Initialize the database
        insertedFaceMatch = faceMatchRepository.saveAndFlush(faceMatch);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the faceMatch
        restFaceMatchMockMvc
            .perform(delete(ENTITY_API_URL_ID, faceMatch.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return faceMatchRepository.count();
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

    protected FaceMatch getPersistedFaceMatch(FaceMatch faceMatch) {
        return faceMatchRepository.findById(faceMatch.getId()).orElseThrow();
    }

    protected void assertPersistedFaceMatchToMatchAllProperties(FaceMatch expectedFaceMatch) {
        assertFaceMatchAllPropertiesEquals(expectedFaceMatch, getPersistedFaceMatch(expectedFaceMatch));
    }

    protected void assertPersistedFaceMatchToMatchUpdatableProperties(FaceMatch expectedFaceMatch) {
        assertFaceMatchAllUpdatablePropertiesEquals(expectedFaceMatch, getPersistedFaceMatch(expectedFaceMatch));
    }
}
