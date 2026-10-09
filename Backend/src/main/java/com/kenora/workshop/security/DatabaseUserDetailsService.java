package com.kenora.workshop.security;


import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kenora.workshop.repository.UserRepository;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {
    private final UserRepository users;

    public DatabaseUserDetailsService(UserRepository users) { this.users = users; }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = users.findByEmailIgnoreCase(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return User.withUsername(user.getEmail())
            .password(user.getPassword())
            .roles(user.getRole().name())
            .disabled(!user.isEnabled())
            .build();
    }
}
