package com.reactit.kyc.supp.service.impl;

import com.reactit.kyc.supp.domain.Partner;
import com.reactit.kyc.supp.repository.PartnerRepository;
import com.reactit.kyc.supp.service.PartnerService;
import com.reactit.kyc.supp.service.dto.PartnerDTO;
import com.reactit.kyc.supp.service.mapper.PartnerMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.reactit.kyc.supp.domain.Partner}.
 */
@Service
@Transactional
public class PartnerServiceImpl implements PartnerService {

    private static final Logger LOG = LoggerFactory.getLogger(PartnerServiceImpl.class);

    private final PartnerRepository partnerRepository;

    private final PartnerMapper partnerMapper;

    public PartnerServiceImpl(PartnerRepository partnerRepository, PartnerMapper partnerMapper) {
        this.partnerRepository = partnerRepository;
        this.partnerMapper = partnerMapper;
    }

    @Override
    public PartnerDTO save(PartnerDTO partnerDTO) {
        LOG.debug("Request to save Partner : {}", partnerDTO);
        Partner partner = partnerMapper.toEntity(partnerDTO);
        partner = partnerRepository.save(partner);
        return partnerMapper.toDto(partner);
    }

    @Override
    public PartnerDTO update(PartnerDTO partnerDTO) {
        LOG.debug("Request to update Partner : {}", partnerDTO);
        Partner partner = partnerMapper.toEntity(partnerDTO);
        partner = partnerRepository.save(partner);
        return partnerMapper.toDto(partner);
    }

    @Override
    public Optional<PartnerDTO> partialUpdate(PartnerDTO partnerDTO) {
        LOG.debug("Request to partially update Partner : {}", partnerDTO);

        return partnerRepository
            .findById(partnerDTO.getId())
            .map(existingPartner -> {
                partnerMapper.partialUpdate(existingPartner, partnerDTO);

                return existingPartner;
            })
            .map(partnerRepository::save)
            .map(partnerMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PartnerDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Partners");
        return partnerRepository.findAll(pageable).map(partnerMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PartnerDTO> findOne(Long id) {
        LOG.debug("Request to get Partner : {}", id);
        return partnerRepository.findById(id).map(partnerMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Partner : {}", id);
        partnerRepository.deleteById(id);
    }
}
