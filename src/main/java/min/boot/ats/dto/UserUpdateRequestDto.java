package min.boot.ats.dto;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequestDto {

    private String name;        // 이름
    private String email;       // 이메일 (추가)
    private String companyName; // 기업명 (추가)
    private String password;    // 새 비밀번호 (추가)

}