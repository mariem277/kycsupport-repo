package com.reactit.kyc.supp.service.impl;

import com.reactit.kyc.supp.domain.FaceMatch;
import com.reactit.kyc.supp.repository.FaceMatchRepository;
import com.reactit.kyc.supp.service.FaceMatchService;
import com.reactit.kyc.supp.service.dto.FaceMatchDTO;
import com.reactit.kyc.supp.service.mapper.FaceMatchMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.reactit.kyc.supp.domain.FaceMatch}.
 */
@Service
@Transactional
public class FaceMatchServiceImpl implements FaceMatchService {

    private static final Logger LOG = LoggerFactory.getLogger(FaceMatchServiceImpl.class);

    private final FaceMatchRepository faceMatchRepository;

    private final FaceMatchMapper faceMatchMapper;

    public FaceMatchServiceImpl(FaceMatchRepository faceMatchRepository, FaceMatchMapper faceMatchMapper) {
        this.faceMatchRepository = faceMatchRepository;
        this.faceMatchMapper = faceMatchMapper;
    }

    @Override
    public FaceMatchDTO save(FaceMatchDTO faceMatchDTO) {
        LOG.debug("Request to save FaceMatch : {}", faceMatchDTO);
        FaceMatch faceMatch = faceMatchMapper.toEntity(faceMatchDTO);
        faceMatch = faceMatchRepository.save(faceMatch);
        return faceMatchMapper.toDto(faceMatch);
    }

    @Override
    public FaceMatchDTO update(FaceMatchDTO faceMatchDTO) {
        LOG.debug("Request to update FaceMatch : {}", faceMatchDTO);
        FaceMatch faceMatch = faceMatchMapper.toEntity(faceMatchDTO);
        faceMatch = faceMatchRepository.save(faceMatch);
        return faceMatchMapper.toDto(faceMatch);
    }

    @Override
    public Optional<FaceMatchDTO> partialUpdate(FaceMatchDTO faceMatchDTO) {
        LOG.debug("Request to partially update FaceMatch : {}", faceMatchDTO);

        return faceMatchRepository
            .findById(faceMatchDTO.getId())
            .map(existingFaceMatch -> {
                faceMatchMapper.partialUpdate(existingFaceMatch, faceMatchDTO);

                return existingFaceMatch;
            })
            .map(faceMatchRepository::save)
            .map(faceMatchMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FaceMatchDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all FaceMatches");
        return faceMatchRepository.findAll(pageable).map(faceMatchMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<FaceMatchDTO> findOne(Long id) {
        LOG.debug("Request to get FaceMatch : {}", id);
        return faceMatchRepository.findById(id).map(faceMatchMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete FaceMatch : {}", id);
        faceMatchRepository.deleteById(id);
    }
}
