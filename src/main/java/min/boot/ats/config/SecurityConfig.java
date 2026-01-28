package min.boot.ats.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http    .headers(headers -> headers
                        .cacheControl(HeadersConfigurer.CacheControlConfig::disable)
                )// 브라우저 캐싱 방지
                .csrf(AbstractHttpConfigurer::disable) // REST API이므로 CSRF 비활성화

                // CORS 설정 연결
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .authorizeHttpRequests(auth -> auth
                        // 1. [최우선 허용] 정적 리소스 (CSS, JS, 이미지 등)
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                        .requestMatchers("/error", "/favicon.ico", "/static/**", "/css/**", "/js/**").permitAll()

                        // =========================================================
                        // 2. [제한 규칙] 권한이 필요한 요청을 '먼저' 선언 (순서 중요!)
                        // =========================================================

                        // [API 보안] 데이터 변경(POST, PUT, DELETE)은 담당자만 가능
                        .requestMatchers(HttpMethod.POST, "/api/jobs/**").hasAnyRole("ADMIN", "RECRUITER")
                        .requestMatchers(HttpMethod.PUT, "/api/jobs/**").hasAnyRole("ADMIN", "RECRUITER")
                        .requestMatchers(HttpMethod.DELETE, "/api/jobs/**").hasAnyRole("ADMIN", "RECRUITER")
                        .requestMatchers(HttpMethod.PATCH, "/api/jobs/**").hasAnyRole("ADMIN", "RECRUITER")

                        .requestMatchers("/api/companies/**").permitAll()

                        // [View 보안] 관리자용 페이지 접근 차단 (새로고침 시 방어)
                        .requestMatchers(
                                "/jobs/new",
                                "/jobs/edit/**",
                                "/jobs/manage"
                        ).hasAnyRole("ADMIN", "RECRUITER")


                        // =========================================================
                        // 3. [허용 규칙] 광범위한 경로는 '나중에' 선언
                        // =========================================================

                        // [API 허용] 조회(GET) 요청은 누구나 가능
                        .requestMatchers(HttpMethod.GET, "/api/jobs/**").permitAll() // 공고 상세/목록 조회
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll() // 카테고리 조회
                        .requestMatchers("/api/auth/**").permitAll() // 로그인, 회원가입 API

                        // [View 허용] 공개 페이지
                        .requestMatchers(
                                "/",
                                "/login",
                                "/signup",
                                "/reset-password"
                        ).permitAll()

                        // 주의: "/jobs/**"가 "/jobs/manage"보다 아래에 있어야 함
                        .requestMatchers("/jobs", "/jobs/**").permitAll()

                        // [인증 필요] 개인화 된 기능
                        .requestMatchers("/profile", "/withdraw").authenticated()
                        .requestMatchers("/api/chatbot/**").authenticated() // 챗봇

                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )

                // 401 Unauthorized 처리 (JSON 응답)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"error\": \"Unauthorized\"}");
                        })
                        .accessDeniedHandler(accessDeniedHandler()) // 403 처리
                )

                .formLogin(AbstractHttpConfigurer::disable) // 폼 로그인 비활성화

                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK);
                        })
                        .permitAll()
                );

        return http.build();
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        AccessDeniedHandlerImpl handler = new AccessDeniedHandlerImpl();
        // API 요청에 대한 403 응답 처리를 위해 커스텀하거나, 페이지 리다이렉트를 원하면 아래 유지
        handler.setErrorPage("/access-denied");
        return handler;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}