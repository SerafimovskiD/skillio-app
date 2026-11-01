package mk.skillio.ai;

public record EmbeddingRefreshEvent(Type type, Long id) {

    public enum Type {
        STUDENT,
        POSTING
    }

    public static EmbeddingRefreshEvent student(Long userId){
        return new EmbeddingRefreshEvent(Type.STUDENT, userId);
    }
    public static EmbeddingRefreshEvent posting(Long userId){
        return new EmbeddingRefreshEvent(Type.POSTING, userId);
    }
}
