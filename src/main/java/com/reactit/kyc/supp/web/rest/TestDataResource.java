package com.reactit.kyc.supp.web.rest;

import com.github.javafaker.Faker;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import javax.imageio.ImageIO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class TestDataResource {

    private final Faker faker = new Faker(new Locale("fr"));
    private final Random random = new Random();

    private enum KycStatus {
        PENDING,
        VERIFIED,
        REJECTED,
    }

    public static class TestUser {

        private String id;
        private String fullName;
        private String address;
        private String phoneNumber;
        private KycStatus kycStatus;
        private String documentImageBase64;

        // Getters and setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public KycStatus getKycStatus() {
            return kycStatus;
        }

        public void setKycStatus(KycStatus kycStatus) {
            this.kycStatus = kycStatus;
        }

        public String getDocumentImageBase64() {
            return documentImageBase64;
        }

        public void setDocumentImageBase64(String documentImageBase64) {
            this.documentImageBase64 = documentImageBase64;
        }
    }

    @GetMapping("/test-data")
    public ResponseEntity<List<TestUser>> generateTestData(@RequestParam(defaultValue = "10") int count) {
        List<TestUser> users = IntStream.range(0, count).mapToObj(i -> createTestUser()).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    private TestUser createTestUser() {
        TestUser user = new TestUser();
        user.setId(faker.internet().uuid());
        user.setFullName(faker.name().fullName());
        user.setAddress(faker.address().fullAddress());
        user.setPhoneNumber(faker.phoneNumber().phoneNumber());
        user.setKycStatus(KycStatus.values()[random.nextInt(KycStatus.values().length)]);
        try {
            user.setDocumentImageBase64(generateDocumentImage(user.getFullName()));
        } catch (IOException e) {
            // In case of an error, we can set it to null or a default image
            user.setDocumentImageBase64(null);
        }
        return user;
    }

    private String generateDocumentImage(String userName) throws IOException {
        int width = 400;
        int height = 250;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = image.createGraphics();

        // Background
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, width, height);

        // Header
        g2d.setColor(Color.DARK_GRAY);
        g2d.setFont(new Font("Arial", Font.BOLD, 20));
        g2d.drawString("CARTE D'IDENTITÉ FICTIVE", 50, 40);

        // User Info
        g2d.setColor(Color.BLACK);
        g2d.setFont(new Font("Arial", Font.PLAIN, 16));
        g2d.drawString("Nom: " + userName, 20, 100);
        g2d.drawString("Statut: Approuvé", 20, 130);

        // Placeholder for a photo
        g2d.setColor(Color.LIGHT_GRAY);
        g2d.fillRect(280, 60, 100, 120);
        g2d.setColor(Color.BLACK);
        g2d.drawRect(280, 60, 100, 120);
        g2d.drawString("PHOTO", 305, 125);

        g2d.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "png", baos);
        return Base64.getEncoder().encodeToString(baos.toByteArray());
    }
}
