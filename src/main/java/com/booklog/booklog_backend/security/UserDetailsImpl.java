package com.booklog.booklog_backend.security;

import com.booklog.booklog_backend.entity.User;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private String email;
    private String password;
    private String nickname;
    
    public static UserDetailsImpl build(User user) {
        return new UserDetailsImpl(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            user.getNickname()
        );
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }
    
    public Long getId() {
        return id;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    public String getNickname() {
        return nickname;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
}