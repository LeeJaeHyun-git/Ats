package min.boot.ats.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_categories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = {"parent", "children"})
public class JobCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id") // DDL: parent_id NUMBER(10), FK
    private JobCategory parent;

    /**
     * DDL에는 ON DELETE 옵션이 없으므로
     * cascade / orphanRemoval 을 사용하지 않는다.
     */
    @OneToMany(mappedBy = "parent")
    @OrderBy("displayOrder ASC")
    private List<JobCategory> children = new ArrayList<>();

    // --- 생성자 ---
    @Builder
    public JobCategory(String name, Integer displayOrder, JobCategory parent) {
        this.name = name;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.parent = parent;
    }


    // --- 정보 수정 ---
    public void updateInfo(String name, Integer displayOrder) {
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
        if (displayOrder != null) {
            this.displayOrder = displayOrder;
        }
    }


    // --- 계층 구조 설정 (연관관계 동기화용) ---
    public void setParent(JobCategory parent) {
        if (this.parent != null) {
            this.parent.children.remove(this);
        }
        this.parent = parent;
        if (parent != null && !parent.children.contains(this)) {
            parent.children.add(this);
        }
    }
}
