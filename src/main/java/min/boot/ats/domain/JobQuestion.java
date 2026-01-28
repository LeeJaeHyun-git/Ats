package min.boot.ats.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = "job")
public class JobQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "question_text", nullable = false, length = 1000)
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 50)
    private QuestionType questionType;

    @Column(name = "is_required", nullable = false, length = 1)
    private String isRequired;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Builder
    public JobQuestion(
            String questionText,
            QuestionType questionType,
            String isRequired,
            Integer displayOrder
    ) {
        validateRequired(isRequired);
        validateOrder(displayOrder);

        this.questionText = questionText;
        this.questionType = questionType;
        this.isRequired = isRequired;
        this.displayOrder = displayOrder;
    }

    protected void assignToJob(Job job) {
        this.job = job;
    }

    public void updateQuestion(
            String questionText,
            QuestionType questionType,
            String isRequired,
            Integer displayOrder
    ) {
        validateRequired(isRequired);
        validateOrder(displayOrder);

        this.questionText = questionText;
        this.questionType = questionType;
        this.isRequired = isRequired;
        this.displayOrder = displayOrder;
    }

    public void updateOrder(Integer order) {
        validateOrder(order);
        this.displayOrder = order;
    }

    private void validateRequired(String isRequired) {
        if (isRequired == null || !(isRequired.equals("Y") || isRequired.equals("N"))) {
            throw new IllegalArgumentException("is_required 값은 'Y' 또는 'N'이어야 합니다.");
        }
    }

    private void validateOrder(Integer order) {
        if (order == null || order < 0) {
            throw new IllegalArgumentException("display_order는 0 이상의 정수여야 합니다.");
        }
    }
}