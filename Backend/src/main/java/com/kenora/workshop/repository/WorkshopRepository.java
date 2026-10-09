package com.kenora.workshop.repository;


import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import com.kenora.workshop.entity.Workshop;

import java.util.Optional;

public interface WorkshopRepository extends JpaRepository<Workshop, Long>, JpaSpecificationExecutor<Workshop> {
    boolean existsByCodeIgnoreCase(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select w from Workshop w where w.id = :id")
    Optional<Workshop> findByIdForUpdate(@Param("id") Long id);
}
