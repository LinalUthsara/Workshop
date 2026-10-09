package com.kenora.workshop.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> notFound(ResourceNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));

    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, String>> badRequest(BadRequestException ex) {

        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));

    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validation(MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining("; "));

        return ResponseEntity.badRequest().body(Map.of("message", message));

    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> conflict(DataIntegrityViolationException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(Map.of("message", "A record with the same unique value already exists."));

    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> unauthorized(BadCredentialsException ex) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("message", "Invalid email or password."));

    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> illegalArgument(IllegalArgumentException ex) {

        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        
    }
}
