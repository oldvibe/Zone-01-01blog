package com.blog01.backend.file;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class FileService {

    private final String uploadDir = "uploads";

    public String upload(MultipartFile file) {
        try {
            Files.createDirectories(Path.of(uploadDir));

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Path.of(uploadDir, filename);

            Files.write(path, file.getBytes());

            return filename;
        } catch (Exception e) {
            throw new RuntimeException("File upload failed");
        }
    }
}
