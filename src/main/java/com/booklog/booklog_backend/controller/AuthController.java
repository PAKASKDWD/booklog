package com.booklog.booklog_backend.controller;

import com.booklog.booklog_backend.dto.JwtResponse;
import com.booklog.booklog_backend.dto.UserLoginDto;
import com.booklog.booklog_backend.dto.UserRegistrationDto;
import com.booklog.booklog_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    private final UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDto registrationDto) {
        try {
            userService.registerUser(registrationDto);
            return ResponseEntity.ok().body("회원가입이 완료되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody UserLoginDto loginDto) {
        try {
            JwtResponse jwtResponse = userService.authenticateUser(loginDto);
            return ResponseEntity.ok(jwtResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    }
}