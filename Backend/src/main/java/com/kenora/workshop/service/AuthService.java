package com.kenora.workshop.service;


import org.springframework.security.authentication.*;
import org.springframework.stereotype.Service;

import com.kenora.workshop.dto.request.LoginRequest;
import com.kenora.workshop.dto.response.LoginResponse;
import com.kenora.workshop.entity.User;
import com.kenora.workshop.exception.ResourceNotFoundException;
import com.kenora.workshop.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor 

public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository users;

    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password()));

        User user = users.findByEmailIgnoreCase(request.email())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());

    }

    public LoginResponse currentUser(String email) {

        User user = users.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
        
    }
}
