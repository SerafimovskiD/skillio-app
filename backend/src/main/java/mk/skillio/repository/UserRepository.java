package mk.skillio.repository;

import mk.skillio.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User,Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query(value = """
            select u.id as id,
                   1 - (u.embedding <=> (select p.embedding from job_postings p where p.id = :postingId)) as score
            from users u
            where u.role = 'STUDENT'
              and u.embedding is not null
            order by u.embedding <=> (select p.embedding from job_postings p where p.id = :postingId)
            limit :limit
            """, nativeQuery = true)
    List<ScoredId> findMostSimilarToPosting(@Param("postingId") Long postingId, @Param("limit") int limit);

    @Query(value = "select id from users where role = 'STUDENT' and embedding is null", nativeQuery = true)
    List<Long> findStudentIdsWithoutEmbedding();

    @Query(value = "select id from users where role = 'STUDENT'", nativeQuery = true)
    List<Long> findStudentIds();
}
