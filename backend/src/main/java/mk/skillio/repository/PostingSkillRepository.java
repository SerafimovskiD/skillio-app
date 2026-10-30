package mk.skillio.repository;

import mk.skillio.model.PostingSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PostingSkillRepository extends JpaRepository<PostingSkill,Long> {

    @Query("select ps from PostingSkill ps join fetch ps.skill "
            + "where ps.posting.id in :postingIds")
    List<PostingSkill> findAllByPostingIds(@Param("postingIds") Collection<Long> postingIds);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from PostingSkill ps where ps.posting.id = :postingId")
    void deleteAllByPostingId(@Param("postingId") Long postingId);
}
