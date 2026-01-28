package min.boot.ats.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class JobReorderRequestDto {

    private List<Long> stepIds;      // 전형 단계 순서
    private List<Long> questionIds;  // 지원 요구 사항 순서
}
