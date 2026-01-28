package min.boot.ats.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import min.boot.ats.domain.Role;
import min.boot.ats.domain.User;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor // JSON 직렬화를 위해 기본 생성자 추가
public class UserResponseDto {

    private Long id;            // 사용자 PK (NUMBER)
    private String email;       // 이메일 (VARCHAR2 100)
    private String name;        // 이름 (VARCHAR2 50)
    private Long companyId;     // 소속 기업 ID (FK)
    private String companyName; // 소속 기업명 (Join 결과)
    private Set<String> roles;  // 권한 목록 (user_roles 매핑 결과)

    public UserResponseDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();

        // DDL: company_id NUMBER NOT NULL 제약조건에 따른 안전한 참조
        if (user.getCompany() != null) {
            this.companyId = user.getCompany().getId();
            this.companyName = user.getCompany().getName();
        }

        // user_roles 매핑 테이블을 통해 권한 이름 추출
        this.roles = user.getUserRoles().stream()
                .map(userRole -> userRole.getRole().getRoleName())
                .collect(Collectors.toSet());
    }
}
