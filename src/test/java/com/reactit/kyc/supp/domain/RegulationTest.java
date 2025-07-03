package com.reactit.kyc.supp.domain;

import static com.reactit.kyc.supp.domain.RegulationTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.reactit.kyc.supp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RegulationTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Regulation.class);
        Regulation regulation1 = getRegulationSample1();
        Regulation regulation2 = new Regulation();
        assertThat(regulation1).isNotEqualTo(regulation2);

        regulation2.setId(regulation1.getId());
        assertThat(regulation1).isEqualTo(regulation2);

        regulation2 = getRegulationSample2();
        assertThat(regulation1).isNotEqualTo(regulation2);
    }
}
