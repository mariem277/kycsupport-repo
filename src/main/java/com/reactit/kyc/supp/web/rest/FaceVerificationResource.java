package com.reactit.kyc.supp.web.rest;

import com.reactit.kyc.supp.service.FaceVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class FaceVerificationResource {

    @Autowired
    private FaceVerificationService faceVerificationService;

    @PostMapping("/verify_face_match")
    public ResponseEntity<String> verifyFace(
        @RequestParam("img1") MultipartFile img1,
        @RequestParam("img2") MultipartFile img2
    ) throws IOException {
        String result = faceVerificationService.verifyFaceMatch(img1, img2);
        return ResponseEntity.ok(result);
    }
}
