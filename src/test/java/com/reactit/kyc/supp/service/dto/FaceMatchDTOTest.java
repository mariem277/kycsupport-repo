package com.reactit.kyc.supp.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.reactit.kyc.supp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class FaceMatchDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(FaceMatchDTO.class);
        FaceMatchDTO faceMatchDTO1 = new FaceMatchDTO();
        faceMatchDTO1.setId(1L);
        FaceMatchDTO faceMatchDTO2 = new FaceMatchDTO();
        assertThat(faceMatchDTO1).isNotEqualTo(faceMatchDTO2);
        faceMatchDTO2.setId(faceMatchDTO1.getId());
        assertThat(faceMatchDTO1).isEqualTo(faceMatchDTO2);
        faceMatchDTO2.setId(2L);
        assertThat(faceMatchDTO1).isNotEqualTo(faceMatchDTO2);
        faceMatchDTO1.setId(null);
        assertThat(faceMatchDTO1).isNotEqualTo(faceMatchDTO2);
    }
}
