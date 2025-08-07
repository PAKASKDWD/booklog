package com.booklog.booklog_backend.controller;

import com.booklog.booklog_backend.entity.User;
import com.booklog.booklog_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TestController {
    
    private final UserRepository userRepository;
    
    // @GetMapping("/")
    // public String hello() {
    //     return "Booklog Backend API Server is running!";
    // }
    
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
    
    @GetMapping("/test/users")
    public List<User> getUsers() {
        return userRepository.findAll();
    }
}