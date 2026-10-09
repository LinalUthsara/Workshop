package com.kenora.workshop.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.kenora.workshop.dto.request.LoginRequest;
import com.kenora.workshop.dto.response.LoginResponse;
import com.kenora.workshop.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor 

public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {

        return authService.login(request);

    }

    @GetMapping("/me")
    public LoginResponse me(Authentication authentication) {
        
        return authService.currentUser(authentication.getName());
        
    }
}
