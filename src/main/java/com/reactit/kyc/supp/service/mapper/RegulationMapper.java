package com.reactit.kyc.supp.service.mapper;

import com.reactit.kyc.supp.domain.Regulation;
import com.reactit.kyc.supp.service.dto.RegulationDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Regulation} and its DTO {@link RegulationDTO}.
 */
@Mapper(componentModel = "spring")
public interface RegulationMapper extends EntityMapper<RegulationDTO, Regulation> {}
