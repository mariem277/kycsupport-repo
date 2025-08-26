package com.reactit.kyc.supp.service;

import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FaceVerificationService {

    @Value("${face.verification.api.url:http://localhost:8000}")
    private String pythonApiUrl;

    public String verifyFaceMatch(MultipartFile img1, MultipartFile img2) throws IOException {
        String endpoint = pythonApiUrl + "/api/verify_face_match";

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("img1", new MultipartInputResource(img1));
        body.add("img2", new MultipartInputResource(img2));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(endpoint, requestEntity, String.class);
        return response.getBody();
    }
}
