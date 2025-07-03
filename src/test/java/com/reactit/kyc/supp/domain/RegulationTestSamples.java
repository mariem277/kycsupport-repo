package com.reactit.kyc.supp.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class RegulationTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Regulation getRegulationSample1() {
        return new Regulation().id(1L).title("title1").sourceUrl("sourceUrl1");
    }

    public static Regulation getRegulationSample2() {
        return new Regulation().id(2L).title("title2").sourceUrl("sourceUrl2");
    }

    public static Regulation getRegulationRandomSampleGenerator() {
        return new Regulation().id(longCount.incrementAndGet()).title(UUID.randomUUID().toString()).sourceUrl(UUID.randomUUID().toString());
    }
}
