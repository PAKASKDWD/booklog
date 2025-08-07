package com.booklog.booklog_backend.service;

import com.booklog.booklog_backend.dto.UserRegistrationDto;
import com.booklog.booklog_backend.dto.UserLoginDto;
import com.booklog.booklog_backend.dto.JwtResponse;
import com.booklog.booklog_backend.entity.User;
import com.booklog.booklog_backend.repository.UserRepository;
import com.booklog.booklog_backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    
    @Transactional
    public User registerUser(UserRegistrationDto registrationDto) {
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }
        
        User user = new User();
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setNickname(registrationDto.getNickname());
        
        return userRepository.save(user);
    }
    
    public JwtResponse authenticateUser(UserLoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        User user = userRepository.findByEmail(loginDto.getEmail())
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        return new JwtResponse(jwt, user.getId(), user.getEmail(), user.getNickname());
    }
}