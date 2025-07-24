package com.reactit.kyc.supp.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.IOException;

@Service
public class FaceVerificationService {

    public String verifyFaceMatch(MultipartFile img1, MultipartFile img2) throws IOException {
        String pythonApiUrl = "http://localhost:8000/api/verify_face_match";

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("img1", new MultipartInputResource(img1));
        body.add("img2", new MultipartInputResource(img2));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(pythonApiUrl, requestEntity, String.class);
        return response.getBody();
    }
}
