package mk.skillio.dto;

import org.springframework.core.io.Resource;

public record CvFile(Resource resource, String fileName) {
}