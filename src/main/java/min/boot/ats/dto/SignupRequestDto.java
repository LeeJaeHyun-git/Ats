package min.boot.ats.dto;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequestDto {

    private String email;      // 이메일 (VARCHAR2 100, UNIQUE)
    private String password;   // 비밀번호 (VARCHAR2 255)
    private String name;       // 이름 (VARCHAR2 50)
    private Long companyId;    // 소속 기업 ID (FK to companies.id)
    private String role; // 선택한 권한

}