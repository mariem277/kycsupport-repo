package com.reactit.kyc.supp.web.rest;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.StatObjectArgs;
import io.minio.errors.MinioException;
import java.io.InputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class FileResource {

    private final Logger log = LoggerFactory.getLogger(FileResource.class);

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public FileResource(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    @GetMapping("/files/{objectName:.+}")
    public ResponseEntity<InputStreamResource> getFile(@PathVariable String objectName) {
        log.debug("REST request to get file: {}/{}", bucketName, objectName);
        try {
            // Get metadata to determine content type
            var stat = minioClient.statObject(StatObjectArgs.builder().bucket(bucketName).object(objectName).build());

            // Get the file's input stream
            InputStream inputStream = minioClient.getObject(GetObjectArgs.builder().bucket(bucketName).object(objectName).build());

            InputStreamResource resource = new InputStreamResource(inputStream);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + objectName + "\"");

            return ResponseEntity.ok()
                .headers(headers)
                .contentLength(stat.size())
                .contentType(MediaType.parseMediaType(stat.contentType()))
                .body(resource);
        } catch (MinioException e) {
            log.error("Error retrieving file from MinIO: " + e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            log.error("An unexpected error occurred while retrieving file: " + e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
