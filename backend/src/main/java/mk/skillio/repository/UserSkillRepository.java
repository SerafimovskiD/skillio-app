package mk.skillio.repository;

import mk.skillio.model.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    @Query("select us from UserSkill us join fetch us.skill s join fetch s.category "
            + "where us.user.id = :userId order by s.name")
    List<UserSkill> findAllByUserIdWithSkill(@Param("userId")Long userId);

    Optional<UserSkill> findByUserIdAndSkillId(Long userId, Long skillId);

    @Query("select us from UserSkill us join fetch us.skill s where us.user.id in :userIds")
    List<UserSkill> findAllByUserIdsWithSkill(@Param("userIds") java.util.Collection<Long> userIds);

}
