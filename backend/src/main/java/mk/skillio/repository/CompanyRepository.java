package mk.skillio.repository;

import mk.skillio.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


public interface CompanyRepository extends JpaRepository<Company, Long> {
}
