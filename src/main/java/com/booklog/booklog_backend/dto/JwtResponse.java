package com.booklog.booklog_backend.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String nickname;
    
    public JwtResponse(String token, Long id, String email, String nickname) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.nickname = nickname;
    }
}