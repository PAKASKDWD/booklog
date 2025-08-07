package com.booklog.booklog_backend.config;

import com.booklog.booklog_backend.security.AuthTokenFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final UserDetailsService userDetailsService;
    private final AuthTokenFilter authTokenFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .authorizeHttpRequests(authz -> authz
                // 🔓 정적 리소스들 허용 (이 부분이 중요!)
                .requestMatchers("/", "/index.html").permitAll()                    // 메인 페이지
                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()     // CSS, JS, 이미지 파일들
                .requestMatchers("/static/**").permitAll()                         // 정적 파일들
                .requestMatchers("/*.css", "/*.js", "/*.ico").permitAll()          // 루트의 정적 파일들
                
                // 🔓 API 엔드포인트들
                .requestMatchers("/api/auth/**").permitAll()     // 인증 API
                .requestMatchers("/api/images/**").permitAll()   // 이미지 API
                
                // 🔒 나머지 API는 인증 필요
                .requestMatchers("/api/**").authenticated()
                
                // 🔓 그 외 모든 요청 허용 (React Router 등을 위해)
                .anyRequest().permitAll()
            );
        
        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}