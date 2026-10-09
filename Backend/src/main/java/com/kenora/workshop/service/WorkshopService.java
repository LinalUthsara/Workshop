package com.kenora.workshop.service;


import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kenora.workshop.dto.request.WorkshopRequest;
import com.kenora.workshop.dto.response.WorkshopResponse;
import com.kenora.workshop.entity.Workshop;
import com.kenora.workshop.enums.RegistrationStatus;
import com.kenora.workshop.enums.WorkshopStatus;
import com.kenora.workshop.exception.BadRequestException;
import com.kenora.workshop.exception.ResourceNotFoundException;
import com.kenora.workshop.repository.RegistrationRepository;
import com.kenora.workshop.repository.WorkshopRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor 

public class WorkshopService {
    private final WorkshopRepository workshops;
    private final RegistrationRepository registrations;

    @Transactional(readOnly = true)
    public List<WorkshopResponse> findAll(LocalDateTime startDate, LocalDateTime endDate,
                                          WorkshopStatus status, Boolean availableSeats) {

        Specification<Workshop> spec = (root, query, cb) -> cb.conjunction();

        if (startDate != null) spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("dateTime"), startDate));
        
        if (endDate != null) spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("dateTime"), endDate));
        
        if (status != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));

        return workshops.findAll(spec).stream().map(this::toResponse)
            .filter(w -> availableSeats == null || !availableSeats || w.availableSeats() > 0)
            .toList();

    }

    @Transactional(readOnly = true)
    public WorkshopResponse findById(Long id) {

        return toResponse(getWorkshop(id));

    }

    @Transactional
    public WorkshopResponse create(WorkshopRequest request) {

        if (workshops.existsByCodeIgnoreCase(request.code()))
            throw new BadRequestException("Workshop code already exists.");

        Workshop w = new Workshop();
        apply(w, request);

        return toResponse(workshops.save(w));

    }

    @Transactional
    public WorkshopResponse update(Long id, WorkshopRequest request) {

        Workshop w = workshops.findByIdForUpdate(id)
            .orElseThrow(() -> new ResourceNotFoundException("Workshop not found."));

        if (!w.getCode().equalsIgnoreCase(request.code()) && workshops.existsByCodeIgnoreCase(request.code()))
            throw new BadRequestException("Workshop code already exists.");

        long active = registrations.countByWorkshopIdAndStatus(id, RegistrationStatus.ACTIVE);

        if (request.capacity() < active)
            throw new BadRequestException("Capacity cannot be lower than the number of active registrations.");

        apply(w, request);

        return toResponse(w);

    }

    @Transactional
    public void delete(Long id) {

        Workshop w = workshops.findByIdForUpdate(id)
            .orElseThrow(() -> new ResourceNotFoundException("Workshop not found."));

        if (registrations.countByWorkshopIdAndStatus(id, RegistrationStatus.ACTIVE) > 0)
            throw new BadRequestException("Cannot delete a workshop with active registrations. Mark it cancelled instead.");
       
        workshops.delete(w);

    }

    private void apply(Workshop w, WorkshopRequest r) {

        w.setCode(r.code().trim());
        w.setTitle(r.title().trim());
        w.setInstructor(r.instructor().trim());
        w.setDateTime(r.dateTime());
        w.setCapacity(r.capacity());
        w.setStatus(r.status());
        w.setLocation(r.location().trim());

    }

    private Workshop getWorkshop(Long id) {

        return workshops.findById(id).orElseThrow(() -> new ResourceNotFoundException("Workshop not found."));

    }

    private WorkshopResponse toResponse(Workshop w) {

        long active = registrations.countByWorkshopIdAndStatus(w.getId(), RegistrationStatus.ACTIVE);
        long available = Math.max(0, w.getCapacity() - active);

        return new WorkshopResponse(w.getId(), w.getCode(), w.getTitle(), w.getInstructor(),
            w.getDateTime(), w.getCapacity(), active, available, w.getStatus(), w.getLocation());

    }
}
