package com.kenora.workshop.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import com.kenora.workshop.dto.request.CreateUserRequest;
import com.kenora.workshop.dto.response.LoginResponse;
import com.kenora.workshop.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor 

public class UserController {

    private final UserService users;


    @PostMapping
    public LoginResponse create(@Valid @RequestBody CreateUserRequest request) {
        
        return users.create(request);

    }

    @GetMapping

    public List<LoginResponse> findAll() { 
        
        return users.findAll(); 
        
    }
}
