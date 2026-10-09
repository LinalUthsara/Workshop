package com.kenora.workshop.dto.response;

import com.kenora.workshop.enums.Role;

public record LoginResponse(

    Long id, 

    String name, 

    String email, 

    Role role

) {}
