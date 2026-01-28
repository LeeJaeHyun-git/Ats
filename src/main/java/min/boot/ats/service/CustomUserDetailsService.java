package min.boot.ats.service;

import lombok.RequiredArgsConstructor;
import min.boot.ats.domain.User;
import min.boot.ats.repo.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // [수정] 일반 findByEmail 대신, 권한까지 안전하게 가져오는 메서드 사용
        User user = userRepository.findByEmailWithDetails(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("해당 이메일의 사용자를 찾을 수 없습니다: " + email)
                );

        // User 엔티티의 권한 목록을 Spring Security 객체로 변환
        List<SimpleGrantedAuthority> authorities = user.getRoleNames().stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(), // {noop} 접두어가 포함된 비밀번호
                authorities
        );
    }
}
