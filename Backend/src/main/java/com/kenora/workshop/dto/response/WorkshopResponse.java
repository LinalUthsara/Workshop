package com.kenora.workshop.dto.response;

import java.time.LocalDateTime;

import com.kenora.workshop.enums.WorkshopStatus;

public record WorkshopResponse(

    Long id, 

    String code, 

    String title,

    String instructor, 

    LocalDateTime dateTime,

    Integer capacity, 

    long activeRegistrations, 

    long availableSeats,

    WorkshopStatus status, 

    String location
    
) {}
