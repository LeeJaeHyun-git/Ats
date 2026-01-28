package min.boot.ats.service;

import lombok.RequiredArgsConstructor;
import min.boot.ats.domain.Company;
import min.boot.ats.domain.Role;
import min.boot.ats.domain.User;
import min.boot.ats.dto.SignupRequestDto;
import min.boot.ats.dto.UserUpdateRequestDto;
import min.boot.ats.repo.CompanyRepository;
import min.boot.ats.repo.RoleRepository;
import min.boot.ats.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public Long signup(SignupRequestDto dto) {
        // 이메일 중복 검사
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기업입니다."));

        // 권한 조회 (UserRole 매핑용)
        String requestRole = (dto.getRole() != null) ? dto.getRole() : "ROLE_MANAGER";
        Role selectedRole = roleRepository.findByRoleName(requestRole)
                .orElseThrow(() -> new IllegalStateException("등록되지 않은 권한: " + requestRole));

        // User 엔티티 생성 (비밀번호는 {noop} 접두어 포함)
        User user = User.builder()
                .email(dto.getEmail())
                .password("{noop}" + dto.getPassword()) // 평문 방식 반영
                .name(dto.getName())
                .company(company)
                .build();

        // 권한 매핑 (Cascade 설정에 의해 user_roles 테이블에도 자동 저장됨)
        user.addRole(selectedRole);

        // 저장 및 ID 반환
        return userRepository.save(user).getId();
    }

    public Boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public void resetPassword(UserUpdateRequestDto dto) {
        // RecoveryInfo 쿼리를 활용하여 3가지 정보(기업, 이름, 이메일) 대조
        User user = userRepository.findByRecoveryInfo(dto.getCompanyName(), dto.getName(), dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("입력하신 회원 정보가 일치하지 않습니다."));

        // 새 비밀번호 암호화 후 반영
        user.updatePassword("{noop}" + dto.getPassword());
    }
}