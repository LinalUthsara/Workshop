package com.kenora.workshop.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Value("${app.cors.allowed-origin:http://localhost:5173}")
    private String frontendOrigin;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(
                org.springframework.security.config.http.SessionCreationPolicy.STATELESS))
            .httpBasic(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/workshops/*/registrations").hasAnyRole("MANAGER", "STAFF")
                .requestMatchers(HttpMethod.POST, "/api/workshops/**").hasRole("MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/workshops/**").hasRole("MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/api/workshops/**").hasRole("MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/workshops/**").hasRole("MANAGER")
                .requestMatchers("/api/workshops/**").hasAnyRole("MANAGER", "STAFF")
                .requestMatchers("/api/registrations/**").hasAnyRole("MANAGER", "STAFF")
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, exception) ->
                    response.sendError(401, "Authentication required"))
                .accessDeniedHandler((request, response, exception) ->
                    response.sendError(403, "You do not have permission to perform this action"))
            );
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendOrigin));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
