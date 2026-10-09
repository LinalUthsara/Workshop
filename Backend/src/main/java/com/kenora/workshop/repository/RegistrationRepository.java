package com.kenora.workshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kenora.workshop.entity.Registration;
import com.kenora.workshop.enums.RegistrationStatus;

import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    long countByWorkshopIdAndStatus(Long workshopId, RegistrationStatus status);
    List<Registration> findByWorkshopIdOrderByRegisteredAtDesc(Long workshopId);

    @Query("select count(r) > 0 from Registration r where r.workshop.id = :workshopId " +
           "and lower(r.attendeeEmail) = lower(:email) and r.status = :status")
    boolean existsActiveAttendee(@Param("workshopId") Long workshopId,
                                 @Param("email") String email,
                                 @Param("status") RegistrationStatus status);
}
