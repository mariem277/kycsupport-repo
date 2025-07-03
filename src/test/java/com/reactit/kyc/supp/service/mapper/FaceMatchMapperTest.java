package com.reactit.kyc.supp.service.mapper;

import static com.reactit.kyc.supp.domain.FaceMatchAsserts.*;
import static com.reactit.kyc.supp.domain.FaceMatchTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FaceMatchMapperTest {

    private FaceMatchMapper faceMatchMapper;

    @BeforeEach
    void setUp() {
        faceMatchMapper = new FaceMatchMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getFaceMatchSample1();
        var actual = faceMatchMapper.toEntity(faceMatchMapper.toDto(expected));
        assertFaceMatchAllPropertiesEquals(expected, actual);
    }
}
