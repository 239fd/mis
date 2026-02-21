package by.bsuir.mis.config;

import by.bsuir.mis.security.JwtAuthenticationFilter;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth.requestMatchers("/api/v1/auth/**")
                        .permitAll()
                        .requestMatchers("/error")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/services")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/services/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/specialties")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/specialties/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/employees")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/employees/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/employees/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/employees/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/employees/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/employees/**")
                        .hasRole("ADMIN")
                        .requestMatchers("/api/v1/users/**")
                        .hasRole("ADMIN")
                        .requestMatchers("/api/v1/roles/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/services/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/services/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/services/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/specialties/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/specialties/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/specialties/**")
                        .hasRole("ADMIN")
                        .requestMatchers("/api/v1/statistics/**")
                        .hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/schedules/exceptions/**")
                        .hasAnyRole("RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/schedules/exceptions/**")
                        .hasAnyRole("RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/schedules/**")
                        .hasAnyRole("RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/schedules/**")
                        .hasAnyRole("RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/schedules/**")
                        .hasAnyRole("RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/schedules/**")
                        .authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/appointments/employee/*/date/*")
                        .hasAnyRole("DOCTOR", "RECEPTIONIST", "ADMIN", "PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/v1/appointments/employee/**")
                        .hasAnyRole("DOCTOR", "RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/appointments/patient/**")
                        .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/appointments/*/status")
                        .hasAnyRole("DOCTOR", "RECEPTIONIST", "ADMIN", "PATIENT")
                        .requestMatchers(HttpMethod.POST, "/api/v1/appointments")
                        .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/appointments/**")
                        .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/appointments/**")
                        .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/appointments/**")
                        .authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/patients/user/**")
                        .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/patients/link")
                        .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/patients/with-link")
                        .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/patients/unlink/**")
                        .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/patients")
                        .hasAnyRole("RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/patients/**")
                        .hasAnyRole("PATIENT", "RECEPTIONIST", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/patients")
                        .hasAnyRole("RECEPTIONIST", "ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/patients/**")
                        .hasAnyRole("RECEPTIONIST", "ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/doctor-services/**")
                        .authenticated()
                        .requestMatchers("/api/v1/doctor-services/**")
                        .hasAnyRole("ADMIN", "RECEPTIONIST")
                        .anyRequest()
                        .authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-User-Id"));
        configuration.setExposedHeaders(List.of("Authorization"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
