package com.reactit.kyc.supp.service.mapper;

import com.reactit.kyc.supp.domain.Customer;
import com.reactit.kyc.supp.domain.Document;
import com.reactit.kyc.supp.service.dto.CustomerDTO;
import com.reactit.kyc.supp.service.dto.DocumentDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Document} and its DTO {@link DocumentDTO}.
 */
@Mapper(componentModel = "spring")
public interface DocumentMapper extends EntityMapper<DocumentDTO, Document> {
    @Mapping(target = "customer", source = "customer", qualifiedByName = "customerId")
    DocumentDTO toDto(Document s);

    @Named("customerId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(source = "idNumber", target = "idNumber")
    CustomerDTO toDtoCustomerId(Customer customer);
}
