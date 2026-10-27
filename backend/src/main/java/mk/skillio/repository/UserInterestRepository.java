package mk.skillio.repository;

import mk.skillio.model.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserInterestRepository extends JpaRepository<UserInterest, Long> {

    @Query("select ui from UserInterest ui join fetch ui.category c "
            + "where ui.user.id = :userId order by c.name")
    List<UserInterest> findAllByUserIdWithCategory(@Param("userId") Long userId);

    Optional<UserInterest> findByUserIdAndCategoryId(Long userId, Long categoryId);


}
