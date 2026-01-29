package com.blog01.backend.file;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final String uploadDir = "uploads/";

    @PostMapping
    public String upload(@RequestParam MultipartFile file) throws Exception {

        Files.createDirectories(Path.of(uploadDir));

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Path.of(uploadDir + filename);

        Files.write(path, file.getBytes());

        return "/uploads/" + filename;
    }
}
