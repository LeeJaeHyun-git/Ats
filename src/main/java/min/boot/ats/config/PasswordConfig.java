package min.boot.ats.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // 이 팩토리 메서드는 비밀번호 앞의 {noop}, {bcrypt} 접두어를 자동으로 인식합니다.
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}