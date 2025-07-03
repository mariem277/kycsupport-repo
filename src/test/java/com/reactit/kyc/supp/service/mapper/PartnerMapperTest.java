package com.reactit.kyc.supp.service.mapper;

import static com.reactit.kyc.supp.domain.PartnerAsserts.*;
import static com.reactit.kyc.supp.domain.PartnerTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PartnerMapperTest {

    private PartnerMapper partnerMapper;

    @BeforeEach
    void setUp() {
        partnerMapper = new PartnerMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getPartnerSample1();
        var actual = partnerMapper.toEntity(partnerMapper.toDto(expected));
        assertPartnerAllPropertiesEquals(expected, actual);
    }
}
