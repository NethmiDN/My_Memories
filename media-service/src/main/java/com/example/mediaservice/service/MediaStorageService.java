package com.example.mediaservice.service;

import com.example.mediaservice.dto.MediaUploadResponse;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class MediaStorageService {

    private static final Logger logger = LoggerFactory.getLogger(MediaStorageService.class);

    @Value("${gcp.bucket-name:my-memories-media-bucket}")
    private String bucketName;

    @Value("${gcp.project-id:my-memories-project}")
    private String projectId;

    @Value("${gcp.credentials-location:}")
    private String credentialsLocation;

    @Value("${gcp.local-storage-dir:./uploaded-media}")
    private String localStorageDir;

    private Storage gcpStorage;
    private Path localPath;

    @PostConstruct
    public void init() {
        this.localPath = Paths.get(localStorageDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.localPath);
        } catch (IOException e) {
            logger.error("Could not create local storage directory", e);
        }

        // Try initializing GCP Cloud Storage SDK
        try {
            if (StringUtils.hasText(credentialsLocation) && Files.exists(Paths.get(credentialsLocation))) {
                GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(credentialsLocation));
                this.gcpStorage = StorageOptions.newBuilder()
                        .setProjectId(projectId)
                        .setCredentials(credentials)
                        .build()
                        .getService();
                logger.info("GCP Cloud Storage SDK initialized with credentials from {}", credentialsLocation);
            } else {
                // Try default environment credentials
                this.gcpStorage = StorageOptions.newBuilder()
                        .setProjectId(projectId)
                        .build()
                        .getService();
                logger.info("GCP Cloud Storage SDK initialized with default environment options.");
            }
        } catch (Exception e) {
            logger.warn("GCP Cloud Storage SDK setup skipped or unauthenticated ({}). Local disk storage fallback enabled.", e.getMessage());
            this.gcpStorage = null;
        }
    }

    public MediaUploadResponse uploadFile(MultipartFile file, String eventId) throws IOException {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String extension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i);
        }

        String fileId = UUID.randomUUID().toString();
        String uniqueFileName = "event_" + (eventId != null ? eventId : "global") + "_" + fileId + extension;

        String publicUrl;

        if (gcpStorage != null) {
            try {
                BlobId blobId = BlobId.of(bucketName, uniqueFileName);
                BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                        .setContentType(file.getContentType())
                        .build();

                gcpStorage.create(blobInfo, file.getBytes());
                publicUrl = String.format("https://storage.googleapis.com/%s/%s", bucketName, uniqueFileName);
                logger.info("File uploaded successfully to GCP Bucket {}: {}", bucketName, publicUrl);
            } catch (Exception e) {
                logger.warn("GCP upload failed ({}), storing locally.", e.getMessage());
                publicUrl = storeLocally(file, uniqueFileName);
            }
        } else {
            publicUrl = storeLocally(file, uniqueFileName);
        }

        return new MediaUploadResponse(
                fileId,
                uniqueFileName,
                publicUrl,
                eventId,
                file.getContentType(),
                file.getSize(),
                LocalDateTime.now()
        );
    }

    private String storeLocally(MultipartFile file, String fileName) throws IOException {
        Path targetLocation = this.localPath.resolve(fileName);
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
        }
        // Returns gateway-routable URL for retrieving file content
        return "/api/media/files/" + fileName;
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.localPath.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + fileName, ex);
        }
    }
}
