package com.reactit.kyc.supp.domain;

import static com.reactit.kyc.supp.domain.CustomerTestSamples.*;
import static com.reactit.kyc.supp.domain.DocumentTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.reactit.kyc.supp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DocumentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Document.class);
        Document document1 = getDocumentSample1();
        Document document2 = new Document();
        assertThat(document1).isNotEqualTo(document2);

        document2.setId(document1.getId());
        assertThat(document1).isEqualTo(document2);

        document2 = getDocumentSample2();
        assertThat(document1).isNotEqualTo(document2);
    }

    @Test
    void customerTest() {
        Document document = getDocumentRandomSampleGenerator();
        Customer customerBack = getCustomerRandomSampleGenerator();

        document.setCustomer(customerBack);
        assertThat(document.getCustomer()).isEqualTo(customerBack);

        document.customer(null);
        assertThat(document.getCustomer()).isNull();
    }
}
