package com.kenora.workshop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

import com.kenora.workshop.enums.RegistrationStatus;

@Entity
@Setter 
@Getter 
@Table(name = "registrations", indexes = {
    @Index(name = "idx_registration_workshop_status", columnList = "workshop_id,status"),
    @Index(name = "idx_registration_email", columnList = "attendee_email")
})

public class Registration {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workshop_id", nullable = false)
    private Workshop workshop;

    @Column(nullable = false, length = 120)
    private String attendeeName;

    @Column(nullable = false, length = 190)
    private String attendeeEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RegistrationStatus status = RegistrationStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registered_by", nullable = false)
    private User registeredBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by")
    private User cancelledBy;

    private LocalDateTime cancelledAt;

    @PrePersist
    void onCreate() {
        
        registeredAt = LocalDateTime.now();
        if (attendeeEmail != null) attendeeEmail = attendeeEmail.trim().toLowerCase();
    }

}
