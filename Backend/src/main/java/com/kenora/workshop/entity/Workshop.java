package com.kenora.workshop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

import com.kenora.workshop.enums.WorkshopStatus;

@Entity
@Getter 
@Setter 
@Table(name = "workshops", uniqueConstraints = @UniqueConstraint(name = "uk_workshops_code", columnNames = "code"))

public class Workshop {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 120)
    private String instructor;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkshopStatus status = WorkshopStatus.OPEN;

    @Column(nullable = false, length = 100)
    private String location = "Main Centre";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { 
        
        createdAt = LocalDateTime.now(); 
    }

}
