package com.reactit.kyc.supp.service.impl;

import com.reactit.kyc.supp.domain.Regulation;
import com.reactit.kyc.supp.repository.RegulationRepository;
import com.reactit.kyc.supp.service.RegulationService;
import com.reactit.kyc.supp.service.dto.RegulationDTO;
import com.reactit.kyc.supp.service.mapper.RegulationMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.reactit.kyc.supp.domain.Regulation}.
 */
@Service
@Transactional
public class RegulationServiceImpl implements RegulationService {

    private static final Logger LOG = LoggerFactory.getLogger(RegulationServiceImpl.class);

    private final RegulationRepository regulationRepository;

    private final RegulationMapper regulationMapper;

    public RegulationServiceImpl(RegulationRepository regulationRepository, RegulationMapper regulationMapper) {
        this.regulationRepository = regulationRepository;
        this.regulationMapper = regulationMapper;
    }

    @Override
    public RegulationDTO save(RegulationDTO regulationDTO) {
        LOG.debug("Request to save Regulation : {}", regulationDTO);
        Regulation regulation = regulationMapper.toEntity(regulationDTO);
        regulation = regulationRepository.save(regulation);
        return regulationMapper.toDto(regulation);
    }

    @Override
    public RegulationDTO update(RegulationDTO regulationDTO) {
        LOG.debug("Request to update Regulation : {}", regulationDTO);
        Regulation regulation = regulationMapper.toEntity(regulationDTO);
        regulation = regulationRepository.save(regulation);
        return regulationMapper.toDto(regulation);
    }

    @Override
    public Optional<RegulationDTO> partialUpdate(RegulationDTO regulationDTO) {
        LOG.debug("Request to partially update Regulation : {}", regulationDTO);

        return regulationRepository
            .findById(regulationDTO.getId())
            .map(existingRegulation -> {
                regulationMapper.partialUpdate(existingRegulation, regulationDTO);

                return existingRegulation;
            })
            .map(regulationRepository::save)
            .map(regulationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RegulationDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Regulations");
        return regulationRepository.findAll(pageable).map(regulationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RegulationDTO> findOne(Long id) {
        LOG.debug("Request to get Regulation : {}", id);
        return regulationRepository.findById(id).map(regulationMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Regulation : {}", id);
        regulationRepository.deleteById(id);
    }
}
