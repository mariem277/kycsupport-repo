package com.reactit.kyc.supp.web.rest;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.*;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class ImageAnalysisResource {

    private final Logger log = LoggerFactory.getLogger(ImageAnalysisResource.class);

    @PostMapping("/image-analysis")
    public ResponseEntity<Map<String, Object>> analyzeImage(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();

        if (file == null || file.isEmpty()) {
            result.put("error", "No file uploaded");
            return ResponseEntity.badRequest().body(result);
        }

        // 1. Sauvegarder temporairement l'image
        File tempFile;
        try {
            tempFile = File.createTempFile("uploaded-", file.getOriginalFilename());
            file.transferTo(tempFile);
        } catch (IOException e) {
            log.error("Could not save uploaded file", e);
            result.put("error", "Could not save uploaded file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }

        try {
            // 2. Lancer le script Python avec le chemin du fichier
            String pythonExecutable = "python"; // ou "python3"
            String scriptPath = "src/main/python/scripts/image-analyzer.py";
            ProcessBuilder processBuilder = new ProcessBuilder(pythonExecutable, scriptPath, tempFile.getAbsolutePath());
            Process process = processBuilder.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line);
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> parsed = mapper.readValue(output.toString(), new TypeReference<>() {});
                result.put("qualityScore", parsed.get("qualityScore"));
                result.put("issues", parsed.get("issues"));
            } else {
                BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
                StringBuilder errorOutput = new StringBuilder();
                while ((line = errorReader.readLine()) != null) {
                    errorOutput.append(line);
                }
                log.error("Python script error: {}", errorOutput);
                result.put("error", "Image analysis failed: " + errorOutput);
            }
        } catch (IOException | InterruptedException e) {
            log.error("Error executing Python script", e);
            result.put("error", "Server error during image analysis: " + e.getMessage());
        } finally {
            // Supprimer le fichier temporaire
            if (tempFile.exists()) tempFile.delete();
        }

        return ResponseEntity.ok(result);
    }
}
