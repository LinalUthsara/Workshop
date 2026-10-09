package com.kenora.workshop.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.kenora.workshop.dto.request.RegistrationRequest;
import com.kenora.workshop.dto.response.RegistrationResponse;
import com.kenora.workshop.service.RegistrationService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor 

public class RegistrationController {

    private final RegistrationService service;


    @PostMapping("/workshops/{workshopId}/registrations")
    public RegistrationResponse register(@PathVariable Long workshopId,
                                         @Valid @RequestBody RegistrationRequest request,
                                         Authentication authentication) {

        return service.register(workshopId, request, authentication.getName());

    }

    @GetMapping("/workshops/{workshopId}/registrations")
    public List<RegistrationResponse> findByWorkshop(@PathVariable Long workshopId) {

        return service.findByWorkshop(workshopId);

    }

    @GetMapping("/registrations/{id}")
    public RegistrationResponse findById(@PathVariable Long id) {

        return service.findById(id);

    }

    @PatchMapping("/registrations/{id}/cancel")
    public RegistrationResponse cancel(@PathVariable Long id, Authentication authentication) {

        return service.cancel(id, authentication.getName());
        
    }
}
