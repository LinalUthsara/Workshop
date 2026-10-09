package com.kenora.workshop.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import com.kenora.workshop.dto.request.WorkshopRequest;
import com.kenora.workshop.dto.response.WorkshopResponse;
import com.kenora.workshop.enums.WorkshopStatus;
import com.kenora.workshop.service.WorkshopService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/workshops")
@RequiredArgsConstructor 

public class WorkshopController {

    private final WorkshopService service;


    @GetMapping
    public List<WorkshopResponse> findAll(

        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
        @RequestParam(required = false) WorkshopStatus status,
        @RequestParam(required = false) Boolean availableSeats) {

        return service.findAll(startDate, endDate, status, availableSeats);

    }

    @GetMapping("/{id}")
    public WorkshopResponse findById(@PathVariable Long id) { 
        
        return service.findById(id); 
    
    }

    @PostMapping
    public WorkshopResponse create(@Valid @RequestBody WorkshopRequest request) {

        return service.create(request);

    }

    @PutMapping("/{id}")
    public WorkshopResponse update(@PathVariable Long id, @Valid @RequestBody WorkshopRequest request) {

        return service.update(id, request);

    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { 
        
        service.delete(id); 

    }
}
