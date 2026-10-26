package mk.skillio.repository;

import mk.skillio.enums.SkillLevel;
import mk.skillio.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill,Long> {

    @Query("select s from Skill s join fetch s.category c order by c.name, s.name")
    List<Skill> findAllWithCategory();
}
