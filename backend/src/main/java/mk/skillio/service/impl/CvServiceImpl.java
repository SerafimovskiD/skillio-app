package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.CvFile;
import mk.skillio.dto.CvResponse;
import mk.skillio.exception.BadRequestException;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.User;
import mk.skillio.repository.UserRepository;
import mk.skillio.service.CvService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CvServiceImpl implements CvService {

    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;
    private static final byte[] PDF_MAGIC = "%PDF-".getBytes(StandardCharsets.US_ASCII);

    private final UserRepository userRepository;

    @Value("${app.cv.dir:uploads/cv}")
    private String cvDir;

    @Override
    @Transactional
    public CvResponse upload(String studentEmail, MultipartFile file) {
        User user = findUser(studentEmail);
        validate(file);

        String storedName = UUID.randomUUID() + ".pdf";
        Path target = resolve(storedName);
        try {
            Files.createDirectories(target.getParent());
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new BadRequestException("The CV could not be saved. Please try again.");
        }

        String oldStoredName = user.getCvStoredName();
        user.setCvStoredName(storedName);
        user.setCvFileName(cleanFileName(file.getOriginalFilename()));
        user.setCvUploadedAt(Instant.now());
        userRepository.save(user);

        deleteQuietly(oldStoredName);
        return toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public CvResponse getInfo(String studentEmail) {
        User user = findUser(studentEmail);
        return user.getCvStoredName() == null ? null : toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public CvFile download(String studentEmail) {
        return loadFile(findUser(studentEmail));
    }

    @Override
    @Transactional(readOnly = true)
    public CvFile loadFile(User user) {
        if (user.getCvStoredName() == null) {
            throw new ResourceNotFoundException("CV not found");
        }
        Path path = resolve(user.getCvStoredName());
        if (!Files.isReadable(path)) {
            throw new ResourceNotFoundException("CV not found");
        }
        return new CvFile(new FileSystemResource(path), user.getCvFileName());
    }

    @Override
    @Transactional
    public void delete(String studentEmail) {
        User user = findUser(studentEmail);
        String storedName = user.getCvStoredName();
        user.setCvStoredName(null);
        user.setCvFileName(null);
        user.setCvUploadedAt(null);
        userRepository.save(user);
        deleteQuietly(storedName);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Select a PDF file.");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BadRequestException("CV is too large (maximum 5 MB).");
        }
        try (InputStream in = file.getInputStream()) {
            byte[] head = in.readNBytes(PDF_MAGIC.length);
            if (!Arrays.equals(head, PDF_MAGIC)) {
                throw new BadRequestException("Only PDF files are allowed.");
            }
        } catch (IOException e) {
            throw new BadRequestException("The file cannot be read.");
        }
    }

    private String cleanFileName(String original) {
        if (original == null || original.isBlank()) {
            return "cv.pdf";
        }
        String name = Paths.get(original.replace('\\', '/')).getFileName().toString().trim();
        if (name.isEmpty()) {
            return "cv.pdf";
        }
        return name.length() > 200 ? name.substring(name.length() - 200) : name;
    }

    private Path resolve(String storedName) {
        Path root = Paths.get(cvDir).toAbsolutePath().normalize();
        Path path = root.resolve(storedName).normalize();
        if (!path.startsWith(root)) {
            throw new BadRequestException("Invalid file name.");
        }
        return path;
    }

    private void deleteQuietly(String storedName) {
        if (storedName == null) {
            return;
        }
        try {
            Files.deleteIfExists(resolve(storedName));
        } catch (IOException ignored) {
            // not critical: at worst an unused file stays on disk
        }
    }

    private CvResponse toResponse(User user) {
        return new CvResponse(user.getCvFileName(), user.getCvUploadedAt());
    }
}