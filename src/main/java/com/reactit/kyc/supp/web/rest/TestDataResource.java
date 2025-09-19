package com.reactit.kyc.supp.web.rest;

import com.github.javafaker.Faker;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import javax.imageio.ImageIO;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class TestDataResource {

    private static final Logger LOG = LoggerFactory.getLogger(TestDataResource.class);
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
        List<TestUser> users = IntStream.range(0, count)
            .mapToObj(i -> {
                try {
                    return generateFakeUser();
                } catch (IOException e) {
                    LOG.error("Error generating fake user", e);
                    return null;
                }
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    public TestUser generateFakeUser() throws IOException {
        Faker faker = new Faker();
        TestUser user = new TestUser();

        user.setId(UUID.randomUUID().toString());
        user.setFullName(faker.name().fullName());
        user.setAddress(faker.address().fullAddress());
        user.setPhoneNumber(faker.phoneNumber().cellPhone());
        user.setIdNumber(faker.number().digits(8));

        // ✅ formatted date YYYY/MM/DD
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
        String dob = faker.date().birthday(18, 80).toInstant().atZone(ZoneId.systemDefault()).toLocalDate().format(formatter);

        user.setDateOfBirth(dob);

        // initially status is PENDING
        user.setKycStatus(KycStatus.PENDING);

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

    @PostMapping("/verify-user")
    public ResponseEntity<TestUser> verifyUser(@RequestBody TestUser user) {
        try {
            byte[] imageBytes = Base64.getDecoder().decode(user.getDocumentImageBase64());
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));

            Tesseract tesseract = new Tesseract();

            // Important : il faut mettre le chemin du dossier parent de "tessdata"
            tesseract.setDatapath("C:/Program Files/Tesseract-OCR/tessdata");

            // Si tu veux OCR en anglais
            tesseract.setLanguage("eng");

            // Ou plusieurs langues, par exemple anglais + français
            // tesseract.setLanguage("eng+fra");

            String extractedText = tesseract.doOCR(image);
            LOG.info("Extracted OCR text for user {}:\n{}", user.getId(), extractedText);

            // Normalisation du texte OCR et des attributs user
            String normalizedText = normalizeText(extractedText);
            LOG.info("normalizedText OCR text for user {}:\n{}", user.getId(), normalizedText);

            String fullName = normalizeText(user.getFullName());
            String dob = normalizeText(user.getDateOfBirth());
            String idNumber = normalizeText(user.getIdNumber());

            LOG.info("OCR extracted for user {}: {}", user.getId(), normalizedText);

            boolean fullNameMatch = normalizedText.contains(fullName);
            boolean dobMatch = normalizedText.contains(dob);
            boolean idNumberMatch = normalizedText.contains(idNumber);

            if (fullNameMatch && dobMatch && idNumberMatch) {
                user.setKycStatus(KycStatus.VERIFIED);
            } else {
                user.setKycStatus(KycStatus.REJECTED);
            }
        } catch (Throwable t) {
            LOG.error("Error during OCR verification for user {}", user.getId(), t);
            user.setKycStatus(KycStatus.REJECTED);
        }

        return ResponseEntity.ok(user);
    }

    /**
     * Helper pour nettoyer et normaliser le texte
     */
    private String normalizeText(String text) {
        if (text == null) return "";
        return text
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9/ ]", "") // enlever caractères spéciaux
            .replaceAll("\\s+", " ") // espaces multiples → un espace
            .trim();
    }
}
