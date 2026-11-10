package mk.skillio.service;

import mk.skillio.dto.CvFile;
import mk.skillio.dto.CvResponse;
import mk.skillio.model.User;
import org.springframework.web.multipart.MultipartFile;

public interface CvService {

    CvResponse upload(String studentEmail, MultipartFile file);

    /** Враќа null ако студентот нема CV. */
    CvResponse getInfo(String studentEmail);

    CvFile download(String studentEmail);

    void delete(String studentEmail);

    CvFile loadFile(User student);
}