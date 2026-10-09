package com.kenora.workshop.service;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kenora.workshop.dto.request.RegistrationRequest;
import com.kenora.workshop.dto.response.RegistrationResponse;
import com.kenora.workshop.entity.Registration;
import com.kenora.workshop.entity.User;
import com.kenora.workshop.entity.Workshop;
import com.kenora.workshop.enums.RegistrationStatus;
import com.kenora.workshop.enums.WorkshopStatus;
import com.kenora.workshop.exception.BadRequestException;
import com.kenora.workshop.exception.ResourceNotFoundException;
import com.kenora.workshop.repository.RegistrationRepository;
import com.kenora.workshop.repository.UserRepository;
import com.kenora.workshop.repository.WorkshopRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor 

public class RegistrationService {
    private final RegistrationRepository registrations;
    private final WorkshopRepository workshops;
    private final UserRepository users;

    @Transactional
    public RegistrationResponse register(Long workshopId, RegistrationRequest request, String staffEmail) {

        Workshop workshop = workshops.findByIdForUpdate(workshopId)
            .orElseThrow(() -> new ResourceNotFoundException("Workshop not found."));

        User actor = users.findByEmailIgnoreCase(staffEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Current user not found."));

        if (workshop.getStatus() != WorkshopStatus.OPEN)
            throw new BadRequestException("This workshop is not open for registration.");

        long active = registrations.countByWorkshopIdAndStatus(workshopId, RegistrationStatus.ACTIVE);

        if (active >= workshop.getCapacity())
            throw new BadRequestException("This workshop is full. No seats are available.");
        if (registrations.existsActiveAttendee(workshopId, request.attendeeEmail(), RegistrationStatus.ACTIVE))
            throw new BadRequestException("This attendee is already registered for this workshop.");

        Registration r = new Registration();
        r.setWorkshop(workshop);
        r.setAttendeeName(request.attendeeName().trim());
        r.setAttendeeEmail(request.attendeeEmail().trim().toLowerCase());
        r.setRegisteredBy(actor);
        r.setStatus(RegistrationStatus.ACTIVE);
        return toResponse(registrations.save(r));

    }

    @Transactional
    public RegistrationResponse cancel(Long registrationId, String staffEmail) {

        Registration r = registrations.findById(registrationId)
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found."));


        Workshop lockedWorkshop = workshops.findByIdForUpdate(r.getWorkshop().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Workshop not found."));


        r = registrations.findById(registrationId)
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found."));

        if (r.getStatus() != RegistrationStatus.ACTIVE)
            throw new BadRequestException("This registration has already been cancelled.");

        User actor = users.findByEmailIgnoreCase(staffEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Current user not found."));

        r.setStatus(RegistrationStatus.CANCELLED);
        r.setCancelledBy(actor);
        r.setCancelledAt(java.time.LocalDateTime.now());
        return toResponse(r);

    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> findByWorkshop(Long workshopId) {

        if (!workshops.existsById(workshopId))
            throw new ResourceNotFoundException("Workshop not found.");

        return registrations.findByWorkshopIdOrderByRegisteredAtDesc(workshopId)
            .stream().map(this::toResponse).toList();

    }

    @Transactional(readOnly = true)
    public RegistrationResponse findById(Long id) {

        Registration r = registrations.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found."));

        return toResponse(r);

    }

    private RegistrationResponse toResponse(Registration r) {

        User registered = r.getRegisteredBy();
        User cancelled = r.getCancelledBy();

        return new RegistrationResponse(r.getId(), r.getWorkshop().getId(), r.getWorkshop().getTitle(),
            r.getAttendeeName(), r.getAttendeeEmail(), r.getStatus(),
            registered.getId(), registered.getName(), r.getRegisteredAt(),
            cancelled == null ? null : cancelled.getId(),
            cancelled == null ? null : cancelled.getName(), r.getCancelledAt());

    }
}
