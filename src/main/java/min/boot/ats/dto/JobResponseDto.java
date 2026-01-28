package min.boot.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import min.boot.ats.domain.Job;
import min.boot.ats.domain.JobStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class JobResponseDto {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime deadline;
    private JobStatus status;
    private Long companyId;
    private String companyName;
    private String categoryName;
    private String location;      // 회사 주소 또는 공고 지역
    private String employmentType; // 채용 형태 (정규직, 계약직, 인턴 등)
    private String salaryRange;


    private List<StepResponseDto> steps;
    private List<QuestionResponseDto> questions;

    public JobResponseDto(Job job) {
        this.id = job.getId();
        this.title = job.getTitle();
        this.content = job.getContent();
        this.createdAt = job.getCreatedAt();
        this.deadline = job.getDeadline();
        this.status = job.getStatus();
        this.location = job.getLocation();
        this.employmentType = job.getEmploymentType();
        this.salaryRange = job.getSalaryRange();

        // 기업명 매핑 (Company 엔티티의 name 필드)
        if (job.getCompany() != null) {
            this.companyId = job.getCompany().getId();
            this.companyName = job.getCompany().getName();
        }

        // 카테고리명 매핑 (JobCategory 엔티티의 name 필드)
        if (job.getCategory() != null) {
            this.categoryName = job.getCategory().getName();
        }

        // SQL로 넣은 필드들을 엔티티에서 가져와서 매핑
        this.location = job.getLocation();
        this.employmentType = job.getEmploymentType();

        // 전형 단계 및 문항
        this.steps = job.getSteps().stream()
                .map(step -> new StepResponseDto(step.getStepName(), step.getStepOrder()))
                .collect(Collectors.toList());

        this.questions = job.getQuestions().stream()
                .map(q -> new QuestionResponseDto(
                        q.getQuestionText(),
                        q.getQuestionType().name(),
                        q.getIsRequired(),
                        q.getDisplayOrder()))
                .collect(Collectors.toList());
    }

    @Getter
    @AllArgsConstructor
    public static class StepResponseDto {
        private String name;
        private Integer order;
    }

    @Getter
    @AllArgsConstructor
    public static class QuestionResponseDto {
        private String text;
        private String type;
        private String isRequired;
        private Integer order;
    }
}