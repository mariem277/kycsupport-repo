package com.reactit.kyc.supp.service.mapper;

import static com.reactit.kyc.supp.domain.RegulationAsserts.*;
import static com.reactit.kyc.supp.domain.RegulationTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RegulationMapperTest {

    private RegulationMapper regulationMapper;

    @BeforeEach
    void setUp() {
        regulationMapper = new RegulationMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getRegulationSample1();
        var actual = regulationMapper.toEntity(regulationMapper.toDto(expected));
        assertRegulationAllPropertiesEquals(expected, actual);
    }
}
