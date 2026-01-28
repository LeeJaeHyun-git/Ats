package min.boot.ats.repo;

import min.boot.ats.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * 권한 이름(예: ROLE_ADMIN)으로 권한 정보 조회
     * 설계 명세의 role_name VARCHAR2(20) NOT NULL 컬럼을 기준으로 검색합니다.
     */
    Optional<Role> findByRoleName(String roleName);

}