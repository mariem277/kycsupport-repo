package com.reactit.kyc.supp.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class CustomerTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Customer getCustomerSample1() {
        return new Customer().id(1L).fullName("fullName1").address("address1").phone("phone1").idNumber("idNumber1");
    }

    public static Customer getCustomerSample2() {
        return new Customer().id(2L).fullName("fullName2").address("address2").phone("phone2").idNumber("idNumber2");
    }

    public static Customer getCustomerRandomSampleGenerator() {
        return new Customer()
            .id(longCount.incrementAndGet())
            .fullName(UUID.randomUUID().toString())
            .address(UUID.randomUUID().toString())
            .phone(UUID.randomUUID().toString())
            .idNumber(UUID.randomUUID().toString());
    }
}
