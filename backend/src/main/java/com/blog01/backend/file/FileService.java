package com.blog01.backend.file;

import com.blog01.backend.common.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Slf4j
@Service
public class FileService {

    private final String uploadDir = "uploads/";
    private final Tika tika = new Tika();

    public String uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        try {
            // Verify file content using Apache Tika
            String mimeType = tika.detect(file.getInputStream());
            log.info("Detected MIME type: {}", mimeType);

            if (!isAllowedType(mimeType)) {
                log.warn("File type not allowed: {}", mimeType);
                throw new ApiException(HttpStatus.BAD_REQUEST, 
                    "Invalid file type. We only accept images, videos, and audio files.");
            }

            Files.createDirectories(Path.of(uploadDir));
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Path.of(uploadDir + filename);

            Files.write(path, file.getBytes());
            return "/uploads/" + filename;

        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file");
        }
    }

    private boolean isAllowedType(String mimeType) {
        return mimeType.startsWith("image/") || mimeType.startsWith("video/") || mimeType.startsWith("audio/");
    }
}
