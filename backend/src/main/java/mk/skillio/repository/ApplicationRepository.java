package mk.skillio.repository;

import mk.skillio.model.Application;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long>
{
     boolean existsByUserEmailAndPostingId(String email,Long postingId);
     Optional<Application>findByIdAndUserEmail(Long id,String email);

    @Query("select a from Application a join fetch a.posting p join fetch p.company "
            + "where a.user.email = :email order by a.createdAt desc")
     List<Application> findAllByUserEmail(@Param("email") String email);

    @Query("select a from Application a join fetch a.user "
            + "where a.posting.id = :postingId order by a.createdAt desc")
    List<Application> findAllByPostingId(@Param("postingId") Long postingId);

    Optional<Application> findByIdAndPostingCompanyUserEmail(Long id, String email);
}
