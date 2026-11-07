package mk.skillio.repository;

import mk.skillio.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {

    @Query("select p from JobPosting p join fetch p.company join fetch p.category "
            + "where p.company.id = :companyId order by p.createdAt desc")
    List<JobPosting> findAllByCompanyId(@Param("companyId") long companyId);

    @Query("select p from JobPosting p join fetch p.company join fetch p.category "
            + "where p.id = :id and p.company.id = :companyId")
    Optional<JobPosting>findByIdAndCompanyId(@Param("id") Long id,@Param("companyId")long companyId);


    @Query("select p from JobPosting p join fetch p.company join fetch p.category "
            + "order by p.createdAt desc")
    List<JobPosting> findAllWithDetails();

    @Query("select p from JobPosting p join fetch p.company join fetch p.category "
            + "where p.category.id = :categoryId order by p.createdAt desc")
    List<JobPosting> findAllByCategoryId(@Param("categoryId") Long categoryId);

    @Query("select p from JobPosting p join fetch p.company join fetch p.category " + "where p.id = :id")
    Optional<JobPosting> findByIdWithDetails(@Param("id") Long id);

    boolean existsByIdAndCompanyUserEmail(Long id, String email);

    @Query(value = """
            select p.id as id,
                   1 - (p.embedding <=> (select u.embedding from users u where u.id = :userId)) as score
            from job_postings p
            where p.embedding is not null
              and (p.deadline is null or p.deadline >= current_date)
            order by p.embedding <=> (select u.embedding from users u where u.id = :userId)
            limit :limit
            """, nativeQuery = true)
    List<ScoredId> findMostSimilarToStudent(@Param("userId") Long userId, @Param("limit") int limit);

    @Query("select p from JobPosting p join fetch p.company join fetch p.category "
            + "where p.id in :ids")
    List<JobPosting> findAllByIdWithDetails(@Param("ids") List<Long> ids);

    @Query(value = "select id from job_postings where embedding is null", nativeQuery = true)
    List<Long> findIdsWithoutEmbedding();

    @Query(value = "select id from job_postings where deadline is null or deadline >= current_date",
            nativeQuery = true)
    List<Long> findActiveIds();
}
