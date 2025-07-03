package com.reactit.kyc.supp.service.mapper;

import com.reactit.kyc.supp.domain.Partner;
import com.reactit.kyc.supp.service.dto.PartnerDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Partner} and its DTO {@link PartnerDTO}.
 */
@Mapper(componentModel = "spring")
public interface PartnerMapper extends EntityMapper<PartnerDTO, Partner> {}
