package com.reactit.kyc.supp.web.rest;

import com.reactit.kyc.supp.service.MinioService;
import java.util.Collections;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class FileUploadResource {

    private final MinioService minioService;

    public FileUploadResource(MinioService minioService) {
        this.minioService = minioService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileUrl = minioService.uploadFile(file);
        return ResponseEntity.ok(Collections.singletonMap("fileUrl", fileUrl));
    }
}
