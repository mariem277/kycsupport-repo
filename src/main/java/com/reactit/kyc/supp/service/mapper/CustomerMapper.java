package com.reactit.kyc.supp.service.mapper;

import com.reactit.kyc.supp.domain.Customer;
import com.reactit.kyc.supp.domain.Partner;
import com.reactit.kyc.supp.service.dto.CustomerDTO;
import com.reactit.kyc.supp.service.dto.PartnerDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Customer} and its DTO {@link CustomerDTO}.
 */
@Mapper(componentModel = "spring")
public interface CustomerMapper extends EntityMapper<CustomerDTO, Customer> {
    @Mapping(target = "partner", source = "partner", qualifiedByName = "partnerId")
    CustomerDTO toDto(Customer s);

    @Named("partnerId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    PartnerDTO toDtoPartnerId(Partner partner);
}
