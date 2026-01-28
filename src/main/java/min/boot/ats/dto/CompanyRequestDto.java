package min.boot.ats.dto;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyRequestDto {

    private String name; // 기업명 (VARCHAR2 100) - 설계서 일치

}