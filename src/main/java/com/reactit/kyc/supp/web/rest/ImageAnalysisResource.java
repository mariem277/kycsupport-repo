package com.reactit.kyc.supp.web.rest;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ImageAnalysisResource {

    private final Logger log = LoggerFactory.getLogger(ImageAnalysisResource.class);

    @PostMapping("/image-analysis")
    public ResponseEntity<Map<String, Object>> analyzeImage(@RequestBody Map<String, String> payload) {
        String imageUrl = payload.get("imageUrl");
        Map<String, Object> result = new HashMap<>();

        if (imageUrl == null || imageUrl.isEmpty()) {
            result.put("error", "Image URL is required");
            return ResponseEntity.badRequest().body(result);
        }

        try {
            // Adjust these paths if needed
            String pythonExecutable = "python"; // Or "python3", or full path like "/usr/bin/python3"
            String scriptPath = "src/main/python/scripts/image-analyzer.py";

            ProcessBuilder processBuilder = new ProcessBuilder(pythonExecutable, scriptPath, imageUrl);
            Process process = processBuilder.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line);
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                String jsonOutput = output.toString();
                log.debug("Python script output: {}", jsonOutput);

                // ✅ Parse JSON output using Jackson
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> parsed = mapper.readValue(jsonOutput, new TypeReference<Map<String, Object>>() {});
                result.put("qualityScore", parsed.get("qualityScore"));
                result.put("issues", parsed.get("issues")); // issues will be a List<String> or "None"
            } else {
                BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
                StringBuilder errorOutput = new StringBuilder();
                while ((line = errorReader.readLine()) != null) {
                    errorOutput.append(line);
                }
                log.error("Python script error: {}", errorOutput.toString());
                result.put("error", "Image analysis failed: " + errorOutput.toString());
            }
        } catch (IOException | InterruptedException e) {
            log.error("Error executing Python script", e);
            result.put("error", "Server error during image analysis: " + e.getMessage());
        }

        return ResponseEntity.ok(result);
    }
}
