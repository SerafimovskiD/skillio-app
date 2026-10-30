package mk.skillio.repository;

import mk.skillio.model.SavedPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedPostingRepository extends JpaRepository<SavedPosting, Long> {

    Optional<SavedPosting> findByUserEmailAndPostingId(String email, Long postingId);

    @Query("select s from SavedPosting s join fetch s.posting p join fetch p.company join fetch p.category "
            + "where s.user.email = :email order by s.savedAt desc")
    List<SavedPosting> findAllByUserEmail(@Param("email") String email);
}