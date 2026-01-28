package min.boot.ats.repo;

import min.boot.ats.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일을 통한 사용자 조회 (로그인 핵심 로직)
     * 설계 명세의 email VARCHAR2(100) UNIQUE 컬럼을 기준으로 검색합니다.
     */
    Optional<User> findByEmail(String email);

    /**
     * 이메일 중복 확인
     */
    boolean existsByEmail(String email);

    /**
     * 특정 기업(Company)에 소속된 모든 사용자 조회
     * 설계 명세의 fk_users_company 관계를 활용합니다.
     */
    List<User> findByCompanyId(Long companyId);


    // 기업명(Join), 사용자 이름, 이메일을 모두 체크하는 쿼리
    @Query("SELECT u FROM User u JOIN FETCH u.company c " +
            "WHERE c.name = :companyName AND u.name = :name AND u.email = :email")
    Optional<User> findByRecoveryInfo(
            @Param("companyName") String companyName,
            @Param("name") String name,
            @Param("email") String email
    );

    // UserRepository.java 수정
    @Query("select distinct u from User u " +
            "join fetch u.company " +
            "left join fetch u.userRoles ur " + // [수정] inner join에서 left join으로 변경
            "left join fetch ur.role " +        // 권한이 없어도 유저 객체는 가져오도록 보장
            "where u.email = :email")
    Optional<User> findByEmailWithDetails(@Param("email") String email);

}