package min.boot.ats.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "jobs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = {"steps", "questions", "company", "category", "createdBy"})
@EntityListeners(AuditingEntityListener.class)
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private JobCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "CLOB")
    private String content;

    @Column(length = 255)
    private String location;

    @Column(name = "employment_type", length = 50)
    private String employmentType;

    @Column(name = "salary_range", length = 100)
    private String salaryRange;

    @CreatedDate
    @Column(name = "created_At", updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime deadline;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private JobStatus status = JobStatus.DRAFT;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JobStep> steps = new LinkedHashSet<>();

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JobQuestion> questions = new LinkedHashSet<>();

    // --- 생성자 레벨 빌더 ---
    @Builder
    public Job(Company company, JobCategory category, User createdBy, String title, String content,
               String location, String employmentType, String salaryRange, LocalDateTime deadline, JobStatus status) {
        this.company = company;
        this.category = category;
        this.createdBy = createdBy;
        this.title = title;
        this.content = content;
        this.location = location;
        this.employmentType = employmentType;
        this.salaryRange = salaryRange;
        this.deadline = deadline;
        this.status = (status != null) ? status : JobStatus.DRAFT;
    }

    // --- 연관관계 편의 메서드 ---
    public void addStep(JobStep step) {
        this.steps.add(step);
        step.assignToJob(this);
    }

    public void addQuestion(JobQuestion question) {
        this.questions.add(question);
        question.assignToJob(this);
    }

    /**
     * 공고의 상세 정보 및 추가된 필드들을 일괄 수정합니다.
     */
    public void updateInfo(
            String title, String content, JobStatus status, LocalDateTime deadline,
            JobCategory category, String location, String employmentType, String salaryRange) {

        this.title = title;
        this.content = content;
        this.status = (status != null) ? status : this.status;
        this.deadline = deadline;
        this.category = category;
        this.location = location;
        this.employmentType = employmentType;
        this.salaryRange = salaryRange;
    }

    /**
     * 공고의 상태를 변경합니다.
     */
    public void updateStatus(JobStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("변경할 상태값이 유효하지 않습니다.");
        }
        this.status = status;
    }

    public void updateInfo(String title, String content, String location, String employmentType, String salaryRange, LocalDateTime deadline) {
        this.title = title;
        this.content = content;
        this.location = location;
        this.employmentType = employmentType;
        this.salaryRange = salaryRange;
        this.deadline = deadline;
    }

    public void clearSteps() {
        this.steps.clear();
    }

    public void clearQuestions() {
        this.questions.clear();
    }

}