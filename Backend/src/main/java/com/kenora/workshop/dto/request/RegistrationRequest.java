package com.kenora.workshop.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistrationRequest(

    @NotBlank 
    @Size(max = 120) 
    String attendeeName,

    @NotBlank 
    @Email 
    @Size(max = 190) 
    String attendeeEmail

) {}
