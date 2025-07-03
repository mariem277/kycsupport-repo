package com.reactit.kyc.supp.web.rest;

import static com.reactit.kyc.supp.domain.PartnerAsserts.*;
import static com.reactit.kyc.supp.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reactit.kyc.supp.IntegrationTest;
import com.reactit.kyc.supp.domain.Partner;
import com.reactit.kyc.supp.repository.PartnerRepository;
import com.reactit.kyc.supp.service.dto.PartnerDTO;
import com.reactit.kyc.supp.service.mapper.PartnerMapper;
import jakarta.persistence.EntityManager;
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
 * Integration tests for the {@link PartnerResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PartnerResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_REALM_NAME = "AAAAAAAAAA";
    private static final String UPDATED_REALM_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_CLIENT_ID = "AAAAAAAAAA";
    private static final String UPDATED_CLIENT_ID = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/partners";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private PartnerMapper partnerMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPartnerMockMvc;

    private Partner partner;

    private Partner insertedPartner;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Partner createEntity() {
        return new Partner().name(DEFAULT_NAME).realmName(DEFAULT_REALM_NAME).clientId(DEFAULT_CLIENT_ID);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Partner createUpdatedEntity() {
        return new Partner().name(UPDATED_NAME).realmName(UPDATED_REALM_NAME).clientId(UPDATED_CLIENT_ID);
    }

    @BeforeEach
    void initTest() {
        partner = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedPartner != null) {
            partnerRepository.delete(insertedPartner);
            insertedPartner = null;
        }
    }

    @Test
    @Transactional
    void createPartner() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Partner
        PartnerDTO partnerDTO = partnerMapper.toDto(partner);
        var returnedPartnerDTO = om.readValue(
            restPartnerMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(partnerDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PartnerDTO.class
        );

        // Validate the Partner in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedPartner = partnerMapper.toEntity(returnedPartnerDTO);
        assertPartnerUpdatableFieldsEquals(returnedPartner, getPersistedPartner(returnedPartner));

        insertedPartner = returnedPartner;
    }

    @Test
    @Transactional
    void createPartnerWithExistingId() throws Exception {
        // Create the Partner with an existing ID
        partner.setId(1L);
        PartnerDTO partnerDTO = partnerMapper.toDto(partner);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPartnerMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(partnerDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Partner in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        partner.setName(null);

        // Create the Partner, which fails.
        PartnerDTO partnerDTO = partnerMapper.toDto(partner);

        restPartnerMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(partnerDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRealmNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        partner.setRealmName(null);

        // Create the Partner, which fails.
        PartnerDTO partnerDTO = partnerMapper.toDto(partner);

        restPartnerMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(partnerDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkClientIdIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        partner.setClientId(null);

        // Create the Partner, which fails.
        PartnerDTO partnerDTO = partnerMapper.toDto(partner);

        restPartnerMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(partnerDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPartners() throws Exception {
        // Initialize the database
        insertedPartner = partnerRepository.saveAndFlush(partner);

        // Get all the partnerList
        restPartnerMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(partner.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].realmName").value(hasItem(DEFAULT_REALM_NAME)))
            .andExpect(jsonPath("$.[*].clientId").value(hasItem(DEFAULT_CLIENT_ID)));
    }

    @Test
    @Transactional
    void getPartner() throws Exception {
        // Initialize the database
        insertedPartner = partnerRepository.saveAndFlush(partner);

        // Get the partner
        restPartnerMockMvc
            .perform(get(ENTITY_API_URL_ID, partner.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(partner.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.realmName").value(DEFAULT_REALM_NAME))
            .andExpect(jsonPath("$.clientId").value(DEFAULT_CLIENT_ID));
    }

    @Test
    @Transactional
    void getNonExistingPartner() throws Exception {
        // Get the partner
        restPartnerMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPartner() throws Exception {
        // Initialize the database
        insertedPartner = partnerRepository.saveAndFlush(partner);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the partner
        Partner updatedPartner = partnerRepository.findById(partner.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPartner are not directly saved in db
        em.detach(updatedPartner);
        updatedPartner.name(UPDATED_NAME).realmName(UPDATED_REALM_NAME).clientId(UPDATED_CLIENT_ID);
        PartnerDTO partnerDTO = partnerMapper.toDto(updatedPartner);

        restPartnerMockMvc
            .perform(
                put(ENTITY_API_URL_ID, partnerDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(partnerDTO))
            )
            .andExpect(status().isOk());

        // Validate the Partner in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPartnerToMatchAllProperties(updatedPartner);
    }

    @Test
    @Transactional
    void putNonExistingPartner() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        partner.setId(longCount.incrementAndGet());

        // Create the Partner
        PartnerDTO partnerDTO = partnerMapper.toDto(partner);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPartnerMockMvc
            .perform(
                put(ENTITY_API_URL_ID, partnerDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(partnerDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Partner in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPartner() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        partner.setId(longCount.incrementAndGet());

        // Create the Partner
        PartnerDTO partnerDTO = partnerMapper.toDto(partner);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPartnerMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(partnerDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Partner in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPartner() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        partner.setId(longCount.incrementAndGet());

        // Create the Partner
        PartnerDTO partnerDTO = partnerMapper.toDto(partner);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPartnerMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(partnerDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Partner in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePartnerWithPatch() throws Exception {
        // Initialize the database
        insertedPartner = partnerRepository.saveAndFlush(partner);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the partner using partial update
        Partner partialUpdatedPartner = new Partner();
        partialUpdatedPartner.setId(partner.getId());

        partialUpdatedPartner.clientId(UPDATED_CLIENT_ID);

        restPartnerMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPartner.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPartner))
            )
            .andExpect(status().isOk());

        // Validate the Partner in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPartnerUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedPartner, partner), getPersistedPartner(partner));
    }

    @Test
    @Transactional
    void fullUpdatePartnerWithPatch() throws Exception {
        // Initialize the database
        insertedPartner = partnerRepository.saveAndFlush(partner);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the partner using partial update
        Partner partialUpdatedPartner = new Partner();
        partialUpdatedPartner.setId(partner.getId());

        partialUpdatedPartner.name(UPDATED_NAME).realmName(UPDATED_REALM_NAME).clientId(UPDATED_CLIENT_ID);

        restPartnerMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPartner.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPartner))
            )
            .andExpect(status().isOk());

        // Validate the Partner in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPartnerUpdatableFieldsEquals(partialUpdatedPartner, getPersistedPartner(partialUpdatedPartner));
    }

    @Test
    @Transactional
    void patchNonExistingPartner() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        partner.setId(longCount.incrementAndGet());

        // Create the Partner
        PartnerDTO partnerDTO = partnerMapper.toDto(partner);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPartnerMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partnerDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partnerDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Partner in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPartner() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        partner.setId(longCount.incrementAndGet());

        // Create the Partner
        PartnerDTO partnerDTO = partnerMapper.toDto(partner);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPartnerMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partnerDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Partner in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPartner() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        partner.setId(longCount.incrementAndGet());

        // Create the Partner
        PartnerDTO partnerDTO = partnerMapper.toDto(partner);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPartnerMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(partnerDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Partner in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePartner() throws Exception {
        // Initialize the database
        insertedPartner = partnerRepository.saveAndFlush(partner);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the partner
        restPartnerMockMvc
            .perform(delete(ENTITY_API_URL_ID, partner.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return partnerRepository.count();
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

    protected Partner getPersistedPartner(Partner partner) {
        return partnerRepository.findById(partner.getId()).orElseThrow();
    }

    protected void assertPersistedPartnerToMatchAllProperties(Partner expectedPartner) {
        assertPartnerAllPropertiesEquals(expectedPartner, getPersistedPartner(expectedPartner));
    }

    protected void assertPersistedPartnerToMatchUpdatableProperties(Partner expectedPartner) {
        assertPartnerAllUpdatablePropertiesEquals(expectedPartner, getPersistedPartner(expectedPartner));
    }
}
