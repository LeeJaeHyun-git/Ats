package min.boot.ats.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_steps")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = "job")
public class JobStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * DDL:
     * job_id NUMBER NOT NULL
     * FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
     *
     * → CASCADE 의미는 Job 엔티티의 OneToMany에서 orphanRemoval로 충족
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "step_name", nullable = false, length = 100)
    private String stepName;

    /**
     * DDL: step_order NUMBER(3) NOT NULL
     */
    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    // --- 생성자 ---
    @Builder
    public JobStep(String stepName, Integer stepOrder) {
        validateOrder(stepOrder);
        this.stepName = stepName;
        this.stepOrder = stepOrder;
    }

    // --- 연관관계 동기화 (Job에서만 호출) ---
    protected void assignToJob(Job job) {
        this.job = job;
    }

    // --- 수정 ---
    public void updateStepInfo(String stepName, Integer stepOrder) {
        validateOrder(stepOrder);
        this.stepName = stepName;
        this.stepOrder = stepOrder;
    }

    private void validateOrder(Integer stepOrder) {
        if (stepOrder == null || stepOrder < 0) {
            throw new IllegalArgumentException("전형 순서는 0 이상의 정수여야 합니다.");
        }
    }

    public void updateOrder(Integer stepOrder) {
        validateOrder(stepOrder);
        this.stepOrder = stepOrder;
    }
}