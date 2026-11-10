package mk.skillio.dto;

import java.time.Instant;

public record CvResponse(String fileName, Instant uploadedAt) {
}