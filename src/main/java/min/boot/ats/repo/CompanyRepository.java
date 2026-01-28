package min.boot.ats.repo;

import min.boot.ats.domain.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    /**
     * 회사 이름으로 정확히 일치하는 데이터 조회
     * 설계 명세의 name VARCHAR2(100) 컬럼을 기준으로 검색합니다.
     */
    Optional<Company> findByName(String name);

    /**
     * 특정 회사의 상세 정보와 소속 사용자(users)를 한 번에 조회 (성능 최적화용 Fetch Join)
     * 설계상의 users 테이블과의 연관 관계를 활용합니다.
     */
    @Query("select c from Company c left join fetch c.users where c.id = :id")
    Optional<Company> findByIdWithUsers(@Param("id") Long id);

}