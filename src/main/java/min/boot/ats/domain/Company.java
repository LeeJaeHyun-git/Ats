package min.boot.ats.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "companies")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = {"users", "jobs"}) // 순환 참조 방지
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    // 양방향 연관 관계: 회사에 속한 사용자들
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
    private List<User> users = new ArrayList<>();

    // 양방향 연관 관계: 회사에서 올린 채용 공고들
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
    private List<Job> jobs = new ArrayList<>();

    // Builder 패턴을 사용하여 생성 (ID는 DB가 생성하므로 제외)
    @Builder
    public Company(String name) {
        this.name = name;
    }

    // 비즈니스 메서드 (도메인 주도 설계 기반)
    public void changeName(String newName) {
        if (newName == null || newName.isBlank()) {
            throw new IllegalArgumentException("회사 이름은 필수입니다.");
        }
        this.name = newName;
    }
}