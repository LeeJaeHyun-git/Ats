package min.boot.ats.service;

import lombok.RequiredArgsConstructor;
import min.boot.ats.domain.Job;
import min.boot.ats.domain.User;
import min.boot.ats.dto.UserResponseDto;
import min.boot.ats.dto.UserUpdateRequestDto;
import min.boot.ats.repo.JobRepository;
import min.boot.ats.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    /**
     * [현재 로그인 유저 정보 조회]
     * SecurityContext의 Principal(email)을 기반으로 전역 상태에 필요한 데이터를 반환합니다.
     */
    @Transactional(readOnly = true)
    public UserResponseDto getMyInfo(String email) {
        // 성능 및 지연로딩 에러 방지
        User user = userRepository.findByEmailWithDetails(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        return new UserResponseDto(user);
    }

    /**
     * [사용자 상세 조회]
     */
    public UserResponseDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return new UserResponseDto(user);
    }

    /**
     * [기업별 소속 사용자 조회]
     * users 테이블의 company_id FK를 기반으로 조회합니다.
     */
    public List<UserResponseDto> getUsersByCompany(Long companyId) {
        return userRepository.findByCompanyId(companyId).stream()
                .map(UserResponseDto::new)
                .collect(Collectors.toList());
    }

    /**
     * [사용자 정보 수정]
     * DDL 명세에 따라 name(VARCHAR2 50) 등을 수정합니다.
     */
    @Transactional
    public void updateProfile(Long userId, UserUpdateRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        user.updateInfo(dto.getName());
    }

    @Transactional
    public void withdraw(Long userId) {
        // 사용자 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // [제약 조건 체크] 사용자가 작성한 채용 공고(Job)가 있는지 확인
        // DDL 설계상 jobs 테이블이 users를 참조하고 있으므로, 공고가 남은 상태로 탈퇴하면 FK 에러가 발생합니다.
        List<Job> userJobs = jobRepository.findByCreatedById(userId);
        if (!userJobs.isEmpty()) {
            throw new IllegalStateException("작성하신 채용 공고가 존재하여 탈퇴할 수 없습니다. 먼저 공고를 삭제해주세요.");
        }

        // 탈퇴 수행
        // UserRole은 User 엔티티에 cascade = CascadeType.ALL이 설정되어 있어 함께 삭제됩니다.
        userRepository.delete(user);
    }
}