package min.boot.ats.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = {"password", "userRoles", "company"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true) // [수정] cascade 추가
    private Set<UserRole> userRoles = new HashSet<>();

    @Builder
    public User(Company company, String email, String password, String name) {
        this.company = company;
        this.email = email;
        this.password = password;
        this.name = name;
    }

    // --- 도메인 로직 ---

    public Set<Role> getRoles() {
        return this.userRoles.stream()
                .map(UserRole::getRole)
                .collect(Collectors.toSet());
    }

    public void addRole(Role role) {
        UserRole userRole = UserRole.builder()
                .user(this)
                .role(role)
                .build();
        this.userRoles.add(userRole);
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public Set<String> getRoleNames() {
        return this.userRoles.stream()
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toSet());
    }

    public void updateInfo(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("이름은 필수 입력 항목입니다.");
        }
        this.name = name;
    }
}
