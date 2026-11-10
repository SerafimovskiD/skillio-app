package mk.skillio.controller;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.CvFile;
import mk.skillio.dto.CvResponse;
import mk.skillio.service.CvService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/profile/cv")
@RequiredArgsConstructor
public class CvController {

    private final CvService cvService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CvResponse upload(Authentication authentication, @RequestParam("file") MultipartFile file) {
        return cvService.upload(authentication.getName(), file);
    }

    @GetMapping
    public ResponseEntity<CvResponse> getInfo(Authentication authentication) {
        CvResponse cv = cvService.getInfo(authentication.getName());
        return cv == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(cv);
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> download(Authentication authentication) {
        CvFile file = cvService.download(authentication.getName());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.fileName(), StandardCharsets.UTF_8).build().toString())
                .body(file.resource());
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication authentication) {
        cvService.delete(authentication.getName());
    }
}