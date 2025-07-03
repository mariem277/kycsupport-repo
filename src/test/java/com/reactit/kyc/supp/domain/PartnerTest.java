package com.reactit.kyc.supp.domain;

import static com.reactit.kyc.supp.domain.CustomerTestSamples.*;
import static com.reactit.kyc.supp.domain.PartnerTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.reactit.kyc.supp.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class PartnerTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Partner.class);
        Partner partner1 = getPartnerSample1();
        Partner partner2 = new Partner();
        assertThat(partner1).isNotEqualTo(partner2);

        partner2.setId(partner1.getId());
        assertThat(partner1).isEqualTo(partner2);

        partner2 = getPartnerSample2();
        assertThat(partner1).isNotEqualTo(partner2);
    }

    @Test
    void customersTest() {
        Partner partner = getPartnerRandomSampleGenerator();
        Customer customerBack = getCustomerRandomSampleGenerator();

        partner.addCustomers(customerBack);
        assertThat(partner.getCustomers()).containsOnly(customerBack);
        assertThat(customerBack.getPartner()).isEqualTo(partner);

        partner.removeCustomers(customerBack);
        assertThat(partner.getCustomers()).doesNotContain(customerBack);
        assertThat(customerBack.getPartner()).isNull();

        partner.customers(new HashSet<>(Set.of(customerBack)));
        assertThat(partner.getCustomers()).containsOnly(customerBack);
        assertThat(customerBack.getPartner()).isEqualTo(partner);

        partner.setCustomers(new HashSet<>());
        assertThat(partner.getCustomers()).doesNotContain(customerBack);
        assertThat(customerBack.getPartner()).isNull();
    }
}
