package com.blog01.backend.file;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping
    public String upload(@RequestParam MultipartFile file) {
        return fileService.uploadFile(file);
    }
}
