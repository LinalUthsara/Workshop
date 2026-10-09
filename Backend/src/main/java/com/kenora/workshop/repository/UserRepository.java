package com.kenora.workshop.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.kenora.workshop.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
