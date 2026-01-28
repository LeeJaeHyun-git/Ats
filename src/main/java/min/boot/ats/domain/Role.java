package min.boot.ats.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(of = {"id", "roleName"})
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 권한 식별자 (예: ROLE_ADMIN, ROLE_RECRUITER)
     */
    @Column(name = "role_name", nullable = false, length = 20)
    private String roleName;

    @Column(length = 100)
    private String description;

    @Builder
    public Role(String roleName, String description) {
        this.roleName = roleName;
        this.description = description;
    }
}
