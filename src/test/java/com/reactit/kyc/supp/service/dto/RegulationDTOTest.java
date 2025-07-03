package com.reactit.kyc.supp.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.reactit.kyc.supp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RegulationDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(RegulationDTO.class);
        RegulationDTO regulationDTO1 = new RegulationDTO();
        regulationDTO1.setId(1L);
        RegulationDTO regulationDTO2 = new RegulationDTO();
        assertThat(regulationDTO1).isNotEqualTo(regulationDTO2);
        regulationDTO2.setId(regulationDTO1.getId());
        assertThat(regulationDTO1).isEqualTo(regulationDTO2);
        regulationDTO2.setId(2L);
        assertThat(regulationDTO1).isNotEqualTo(regulationDTO2);
        regulationDTO1.setId(null);
        assertThat(regulationDTO1).isNotEqualTo(regulationDTO2);
    }
}
