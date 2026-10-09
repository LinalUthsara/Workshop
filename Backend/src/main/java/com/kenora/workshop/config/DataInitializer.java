package com.kenora.workshop.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.kenora.workshop.entity.User;
import com.kenora.workshop.entity.Workshop;
import com.kenora.workshop.enums.Role;
import com.kenora.workshop.enums.WorkshopStatus;
import com.kenora.workshop.repository.UserRepository;
import com.kenora.workshop.repository.WorkshopRepository;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedData(UserRepository users, WorkshopRepository workshops,
                               PasswordEncoder encoder,
                               @Value("${app.seed.admin-name}") String adminName,
                               @Value("${app.seed.admin-email}") String adminEmail,
                               @Value("${app.seed.admin-password}") String adminPassword) {
        return args -> {
            if (!users.existsByEmailIgnoreCase(adminEmail)) {

                User admin = new User();
                admin.setName(adminName);
                admin.setEmail(adminEmail);
                admin.setPassword(encoder.encode(adminPassword));
                admin.setRole(Role.ADMIN);
                users.save(admin);
            }
            if (workshops.count() == 0) {

                addWorkshop(workshops, "WS-CODE-001", "Introduction to Coding", "N. Perera",
                    LocalDateTime.now().plusDays(3).withHour(10).withMinute(0).withSecond(0).withNano(0), 20);
                addWorkshop(workshops, "WS-POT-001", "Pottery for Beginners", "S. Fernando",
                    LocalDateTime.now().plusDays(5).withHour(9).withMinute(30).withSecond(0).withNano(0), 12);
                addWorkshop(workshops, "WS-FIT-001", "Community Fitness", "A. Silva",
                    LocalDateTime.now().plusDays(7).withHour(8).withMinute(0).withSecond(0).withNano(0), 15);
            }
        };
    }

    private void addWorkshop(WorkshopRepository repo, String code, String title, String instructor,
                             LocalDateTime dateTime, int capacity) {
                                
        Workshop w = new Workshop();
        w.setCode(code);
        w.setTitle(title);
        w.setInstructor(instructor);
        w.setDateTime(dateTime);
        w.setCapacity(capacity);
        w.setStatus(WorkshopStatus.OPEN);
        w.setLocation("Main Centre");
        repo.save(w);

    }
}
