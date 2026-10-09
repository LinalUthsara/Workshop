package com.kenora.workshop.dto.response;

import java.time.LocalDateTime;

import com.kenora.workshop.enums.RegistrationStatus;

public record RegistrationResponse(

    Long id, 

    Long workshopId, 

    String workshopTitle, 

    String attendeeName, 

    String attendeeEmail,

    RegistrationStatus status, 

    Long registeredById, 

    String registeredByName,

    LocalDateTime registeredAt,

    Long cancelledById,

    String cancelledByName, 

    LocalDateTime cancelledAt

) {}
