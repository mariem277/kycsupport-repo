package com.reactit.kyc.supp.domain;

import static com.reactit.kyc.supp.domain.CustomerTestSamples.*;
import static com.reactit.kyc.supp.domain.FaceMatchTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.reactit.kyc.supp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class FaceMatchTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FaceMatch.class);
        FaceMatch faceMatch1 = getFaceMatchSample1();
        FaceMatch faceMatch2 = new FaceMatch();
        assertThat(faceMatch1).isNotEqualTo(faceMatch2);

        faceMatch2.setId(faceMatch1.getId());
        assertThat(faceMatch1).isEqualTo(faceMatch2);

        faceMatch2 = getFaceMatchSample2();
        assertThat(faceMatch1).isNotEqualTo(faceMatch2);
    }

    @Test
    void customerTest() {
        FaceMatch faceMatch = getFaceMatchRandomSampleGenerator();
        Customer customerBack = getCustomerRandomSampleGenerator();

        faceMatch.setCustomer(customerBack);
        assertThat(faceMatch.getCustomer()).isEqualTo(customerBack);

        faceMatch.customer(null);
        assertThat(faceMatch.getCustomer()).isNull();
    }
}
