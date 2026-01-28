package min.boot.ats.control;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import min.boot.ats.domain.User;
import min.boot.ats.dto.UserResponseDto;
import min.boot.ats.dto.UserUpdateRequestDto;
import min.boot.ats.repo.UserRepository;
import min.boot.ats.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // 사용자 상세 조회
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    // 사용자 정보 수정
    @PutMapping("/{userId}")
    public ResponseEntity<Void> updateUser(
            @PathVariable Long userId,
            @RequestBody UserUpdateRequestDto dto
    ) {
        userService.updateProfile(userId, dto);
        return ResponseEntity.ok().build();
    }

    // 기업별 사용자 목록
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<UserResponseDto>> getUsersByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(userService.getUsersByCompany(companyId));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> withdraw(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {

        // 현재 로그인한 사용자의 ID 조회
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        // 서비스 호출
        userService.withdraw(user.getId());

        // 세션 무효화 (로그아웃 처리)
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok().build();
    }
}
