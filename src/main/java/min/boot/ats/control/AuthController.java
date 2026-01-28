package min.boot.ats.control;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import min.boot.ats.domain.User;
import min.boot.ats.dto.LoginRequestDto;
import min.boot.ats.dto.SignupRequestDto;
import min.boot.ats.dto.UserResponseDto;
import min.boot.ats.dto.UserUpdateRequestDto;
import min.boot.ats.service.AuthService;
import min.boot.ats.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Long> signup(@RequestBody SignupRequestDto dto) {
        Long userId = authService.signup(dto);
        return ResponseEntity.ok(userId);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDto> login(@RequestBody LoginRequestDto dto, HttpServletRequest request) {
        try {
            UsernamePasswordAuthenticationToken token =
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword());

            Authentication authentication = authenticationManager.authenticate(token);

            SecurityContextHolder.getContext().setAuthentication(authentication);

            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            UserResponseDto myInfo = userService.getMyInfo(authentication.getName());
            return ResponseEntity.ok(myInfo);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // 이메일 중복 확인
    @GetMapping("/exists")
    public ResponseEntity<Boolean> exists(@RequestParam String email) {
        return ResponseEntity.ok(authService.existsByEmail(email));
    }

    /**
     * [현재 로그인 유저 정보 조회]
     * 프론트엔드 전역 상태(AuthContext) 동기화를 위해 사용됩니다.
     * 세션에 저장된 Authentication 객체를 통해 본인의 상세 정보를 반환합니다.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(Authentication authentication) {
        // 1. 인증 정보가 없거나 세션이 유효하지 않은 경우
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Authentication 객체에서 로그인 ID(email) 추출
        String email = authentication.getName();

        // Service를 통해 User, Company, Roles가 포함된 DTO 조회
        try {
            UserResponseDto myInfo = userService.getMyInfo(email);
            return ResponseEntity.ok(myInfo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody UserUpdateRequestDto dto) {
        // 서비스 로직 호출 (본인 확인 및 즉시 재설정 수행)
        authService.resetPassword(dto);

        return ResponseEntity.ok(Map.of(
                "message", "비밀번호가 재설정되었습니다. 로그인 페이지로 이동합니다..."
        ));
    }
}
