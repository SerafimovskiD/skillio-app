package mk.skillio.ai;

import lombok.extern.slf4j.Slf4j;
import mk.skillio.exception.EmbeddingUnavailableException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;

@Slf4j
@Component
public class AiClient {

    private final RestClient restClient;

    public AiClient(@Value("${ai.service.url}") String baseUrl,
                    @Value("${ai.service.timeout-seconds}") int timeoutSeconds) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }

    public float[] embed(String text) {
        return embedAll(List.of(text)).get(0);
    }

    public List<float[]> embedAll(List<String> texts) {
        try {
            EmbedResponse response = restClient.post()
                    .uri("/embed")
                    .body(new EmbedRequest(texts))
                    .retrieve()
                    .body(EmbedResponse.class);
            if (response == null || response.embeddings() == null) {
                throw new EmbeddingUnavailableException("AI service returned an empty response", null);
            }
            return response.embeddings().stream().map(this::toArray).toList();
        } catch (EmbeddingUnavailableException e) {
            throw e;
        } catch (HttpClientErrorException e) {
            log.error("AI service rejected the request: {}", e.getResponseBodyAsString());
            throw new IllegalArgumentException("AI service rejected the input", e);
        } catch (Exception e) {
            log.error("AI service call failed", e);
            throw new EmbeddingUnavailableException("AI service is unavailable", e);
        }
    }

    private float[] toArray(List<Double> values) {
        float[] result = new float[values.size()];
        for (int i = 0; i < result.length; i++) {
            result[i] = values.get(i).floatValue();
        }
        return result;
    }

    private record EmbedRequest(List<String> texts) {
    }

    private record EmbedResponse(List<List<Double>> embeddings, int dimension) {
    }
}