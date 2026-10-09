package com.kenora.workshop.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

import com.kenora.workshop.enums.WorkshopStatus;

public record WorkshopRequest(

    @NotBlank 
    @Size(max = 30) 
    String code,

    @NotBlank 
    @Size(max = 150) 
    String title,

    @NotBlank 
    @Size(max = 120) 
    String instructor,

    @NotNull 
    @Future 
    LocalDateTime dateTime,

    @NotNull 
    @Min(1) 
    @Max(10000)
    Integer capacity,

    @NotNull 
    WorkshopStatus status,

    @NotBlank 
    @Size(max = 100) 
    String location

) {}
