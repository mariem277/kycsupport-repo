package com.reactit.kyc.supp.web.rest;

import com.github.javafaker.Faker;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;
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

    // KYC status enum
    private enum KycStatus {
        PENDING,
        VERIFIED,
        REJECTED,
    }

    // TestUser model
    public static class TestUser {

        private String id;
        private String fullName;
        private String dateOfBirth; // YYYY/MM/DD
        private String address; // Postal address
        private String phoneNumber;
        private String idNumber; // ID number
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

        public String getDateOfBirth() {
            return dateOfBirth;
        }

        public void setDateOfBirth(String dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
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

        public String getIdNumber() {
            return idNumber;
        }

        public void setIdNumber(String idNumber) {
            this.idNumber = idNumber;
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

    // REST endpoint to generate test users
    @GetMapping("/test-data")
    public ResponseEntity<List<TestUser>> generateTestData(@RequestParam(defaultValue = "10") int count) {
        List<TestUser> users = IntStream.range(0, count).mapToObj(i -> createTestUser()).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // Generate a single TestUser
    private TestUser createTestUser() {
        TestUser user = new TestUser();
        user.setId(faker.internet().uuid());
        user.setFullName(faker.name().fullName());

        // Birthday formatted YYYY/MM/DD
        Date birthday = faker.date().birthday(18, 80);
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy/MM/dd");
        user.setDateOfBirth(formatter.format(birthday));

        // Address, phone, ID number
        user.setAddress(faker.internet().emailAddress());
        user.setPhoneNumber(faker.phoneNumber().cellPhone());
        user.setIdNumber(faker.idNumber().valid());

        // Random KYC status
        user.setKycStatus(KycStatus.values()[random.nextInt(KycStatus.values().length)]);

        // Generate fake ID card image
        try {
            user.setDocumentImageBase64(generateDocumentImage(user));
        } catch (IOException e) {
            user.setDocumentImageBase64(null);
        }

        return user;
    }

    // Generate fake ID card image
    private String generateDocumentImage(TestUser user) throws IOException {
        int width = 400;
        int height = 250;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = image.createGraphics();

        // Anti-aliasing for smoother text
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Background
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, width, height);

        // Header
        g2d.setColor(Color.DARK_GRAY);
        g2d.setFont(new Font("Arial", Font.BOLD, 20));
        g2d.drawString("FAKE ID CARD", 50, 40);

        // User Info
        g2d.setColor(Color.BLACK);
        g2d.setFont(new Font("Arial", Font.PLAIN, 16));
        g2d.drawString("Full Name: " + user.getFullName(), 20, 100);
        g2d.drawString("Date of Birth: " + user.getDateOfBirth(), 20, 130);
        g2d.drawString("ID Number: " + user.getIdNumber(), 20, 160);

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
