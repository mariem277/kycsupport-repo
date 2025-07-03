package com.reactit.kyc.supp.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class FaceMatchTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static FaceMatch getFaceMatchSample1() {
        return new FaceMatch().id(1L).selfieUrl("selfieUrl1").idPhotoUrl("idPhotoUrl1");
    }

    public static FaceMatch getFaceMatchSample2() {
        return new FaceMatch().id(2L).selfieUrl("selfieUrl2").idPhotoUrl("idPhotoUrl2");
    }

    public static FaceMatch getFaceMatchRandomSampleGenerator() {
        return new FaceMatch()
            .id(longCount.incrementAndGet())
            .selfieUrl(UUID.randomUUID().toString())
            .idPhotoUrl(UUID.randomUUID().toString());
    }
}
