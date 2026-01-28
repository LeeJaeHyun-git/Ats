package min.boot.ats.dto;

import lombok.*;
import min.boot.ats.domain.QuestionType;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRequestDto {
    private Long companyId;
    private Long categoryId;
    private String title;
    private String content;
    private LocalDateTime deadline;
    private List<StepRequestDto> steps;
    private List<QuestionRequestDto> questions;
    private String location;
    private String employmentType;
    private String salaryRange;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StepRequestDto {
        private String name;
        private Integer order; // step_order 매핑
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionRequestDto {
        private String text;
        private QuestionType type; // Enum (TEXT, MULTIPLE_CHOICE 등)
        private String isRequired; // 'Y' 또는 'N'
        private Integer order; // display_order 매핑
    }
}