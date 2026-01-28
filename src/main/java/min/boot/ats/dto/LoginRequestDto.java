package min.boot.ats.dto;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {

    private String email;
    private String password;

}