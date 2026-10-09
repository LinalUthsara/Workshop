package com.kenora.workshop.service;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kenora.workshop.dto.request.CreateUserRequest;
import com.kenora.workshop.dto.response.LoginResponse;
import com.kenora.workshop.entity.User;
import com.kenora.workshop.exception.BadRequestException;
import com.kenora.workshop.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor 

public class UserService {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Transactional
    public LoginResponse create(CreateUserRequest request) {

        if (users.existsByEmailIgnoreCase(request.email()))
            throw new BadRequestException("An account with this email already exists.");

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(encoder.encode(request.password()));
        user.setRole(request.role());
        user.setEnabled(true);
        user = users.save(user);

        return new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());

    }

    @Transactional(readOnly = true)
    public List<LoginResponse> findAll() {

        return users.findAll().stream()
            .map(u -> new LoginResponse(u.getId(), u.getName(), u.getEmail(), u.getRole()))
            .toList();
            
    }
}
