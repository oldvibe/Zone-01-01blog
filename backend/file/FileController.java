package com.blog01.backend.file;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

        return filename;
    }

    // file didn't need a controller just upload in the file service to use it in create post and update profile
}
