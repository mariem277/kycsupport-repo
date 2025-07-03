package com.reactit.kyc.supp.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class PartnerTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Partner getPartnerSample1() {
        return new Partner().id(1L).name("name1").realmName("realmName1").clientId("clientId1");
    }

    public static Partner getPartnerSample2() {
        return new Partner().id(2L).name("name2").realmName("realmName2").clientId("clientId2");
    }

    public static Partner getPartnerRandomSampleGenerator() {
        return new Partner()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .realmName(UUID.randomUUID().toString())
            .clientId(UUID.randomUUID().toString());
    }
}
