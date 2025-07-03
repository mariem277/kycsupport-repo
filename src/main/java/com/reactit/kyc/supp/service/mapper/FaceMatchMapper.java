package com.reactit.kyc.supp.service.mapper;

import com.reactit.kyc.supp.domain.Customer;
import com.reactit.kyc.supp.domain.FaceMatch;
import com.reactit.kyc.supp.service.dto.CustomerDTO;
import com.reactit.kyc.supp.service.dto.FaceMatchDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link FaceMatch} and its DTO {@link FaceMatchDTO}.
 */
@Mapper(componentModel = "spring")
public interface FaceMatchMapper extends EntityMapper<FaceMatchDTO, FaceMatch> {
    @Mapping(target = "customer", source = "customer", qualifiedByName = "customerId")
    FaceMatchDTO toDto(FaceMatch s);

    @Named("customerId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CustomerDTO toDtoCustomerId(Customer customer);
}
