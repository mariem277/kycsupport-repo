package com.reactit.kyc.supp.domain;

import static com.reactit.kyc.supp.domain.CustomerTestSamples.*;
import static com.reactit.kyc.supp.domain.DocumentTestSamples.*;
import static com.reactit.kyc.supp.domain.FaceMatchTestSamples.*;
import static com.reactit.kyc.supp.domain.PartnerTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.reactit.kyc.supp.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CustomerTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Customer.class);
        Customer customer1 = getCustomerSample1();
        Customer customer2 = new Customer();
        assertThat(customer1).isNotEqualTo(customer2);

        customer2.setId(customer1.getId());
        assertThat(customer1).isEqualTo(customer2);

        customer2 = getCustomerSample2();
        assertThat(customer1).isNotEqualTo(customer2);
    }

    @Test
    void documentsTest() {
        Customer customer = getCustomerRandomSampleGenerator();
        Document documentBack = getDocumentRandomSampleGenerator();

        customer.addDocuments(documentBack);
        assertThat(customer.getDocuments()).containsOnly(documentBack);
        assertThat(documentBack.getCustomer()).isEqualTo(customer);

        customer.removeDocuments(documentBack);
        assertThat(customer.getDocuments()).doesNotContain(documentBack);
        assertThat(documentBack.getCustomer()).isNull();

        customer.documents(new HashSet<>(Set.of(documentBack)));
        assertThat(customer.getDocuments()).containsOnly(documentBack);
        assertThat(documentBack.getCustomer()).isEqualTo(customer);

        customer.setDocuments(new HashSet<>());
        assertThat(customer.getDocuments()).doesNotContain(documentBack);
        assertThat(documentBack.getCustomer()).isNull();
    }

    @Test
    void faceMatchesTest() {
        Customer customer = getCustomerRandomSampleGenerator();
        FaceMatch faceMatchBack = getFaceMatchRandomSampleGenerator();

        customer.addFaceMatches(faceMatchBack);
        assertThat(customer.getFaceMatches()).containsOnly(faceMatchBack);
        assertThat(faceMatchBack.getCustomer()).isEqualTo(customer);

        customer.removeFaceMatches(faceMatchBack);
        assertThat(customer.getFaceMatches()).doesNotContain(faceMatchBack);
        assertThat(faceMatchBack.getCustomer()).isNull();

        customer.faceMatches(new HashSet<>(Set.of(faceMatchBack)));
        assertThat(customer.getFaceMatches()).containsOnly(faceMatchBack);
        assertThat(faceMatchBack.getCustomer()).isEqualTo(customer);

        customer.setFaceMatches(new HashSet<>());
        assertThat(customer.getFaceMatches()).doesNotContain(faceMatchBack);
        assertThat(faceMatchBack.getCustomer()).isNull();
    }

    @Test
    void partnerTest() {
        Customer customer = getCustomerRandomSampleGenerator();
        Partner partnerBack = getPartnerRandomSampleGenerator();

        customer.setPartner(partnerBack);
        assertThat(customer.getPartner()).isEqualTo(partnerBack);

        customer.partner(null);
        assertThat(customer.getPartner()).isNull();
    }
}
