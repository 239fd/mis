package by.bsuir.mis.controller;

import by.bsuir.mis.API.ApiResponse;
import by.bsuir.mis.dto.request.LoginRequest;
import by.bsuir.mis.dto.request.RefreshTokenRequest;
import by.bsuir.mis.dto.request.RegisterRequest;
import by.bsuir.mis.dto.response.AuthResponse;
import by.bsuir.mis.dto.response.UserResponse;
import by.bsuir.mis.entity.Role;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.exception.BadRequestException;
import by.bsuir.mis.exception.ResourceAlreadyExistsException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.mapper.UserMapper;
import by.bsuir.mis.security.JwtService;
import by.bsuir.mis.service.RoleService;
import by.bsuir.mis.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.login(), request.password()));

            User user = userService
                    .findByLogin(request.login())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "login", request.login()));

            if (!user.getIsActive()) {
                throw new BadRequestException("User account is deactivated");
            }

            String accessToken = jwtService.generateToken(
                    user.getLogin(), user.getId(), user.getRole().getName());
            String refreshToken = jwtService.generateRefreshToken(user.getLogin(), user.getId());

            AuthResponse authResponse = new AuthResponse(
                    accessToken,
                    refreshToken,
                    user.getId(),
                    user.getLogin(),
                    user.getRole().getName(),
                    jwtExpiration / 1000);

            return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                    .data(authResponse)
                    .status(true)
                    .message("Login successful")
                    .build());

        } catch (BadCredentialsException e) {
            throw new BadRequestException("Invalid login or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        if (userService.existsByLogin(request.login())) {
            throw new ResourceAlreadyExistsException("User", "login", request.login());
        }

        Role patientRole = roleService
                .findByName("PATIENT")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "PATIENT"));

        User user = User.builder()
                .login(request.login())
                .passwordHash(passwordEncoder.encode(request.password()))
                .email(request.email())
                .phone(request.phone())
                .role(patientRole)
                .isActive(true)
                .build();

        User savedUser = userService.save(user);

        String accessToken = jwtService.generateToken(
                savedUser.getLogin(), savedUser.getId(), savedUser.getRole().getName());
        String refreshToken = jwtService.generateRefreshToken(savedUser.getLogin(), savedUser.getId());

        AuthResponse authResponse = new AuthResponse(
                accessToken,
                refreshToken,
                savedUser.getId(),
                savedUser.getLogin(),
                savedUser.getRole().getName(),
                jwtExpiration / 1000);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<AuthResponse>builder()
                        .data(authResponse)
                        .status(true)
                        .message("Registration successful")
                        .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            String username = jwtService.extractUsername(request.refreshToken());

            User user = userService
                    .findByLogin(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "login", username));

            if (!user.getIsActive()) {
                throw new BadRequestException("User account is deactivated");
            }

            if (!jwtService.isTokenValid(request.refreshToken(), username)) {
                throw new BadRequestException("Invalid refresh token");
            }

            String accessToken = jwtService.generateToken(
                    user.getLogin(), user.getId(), user.getRole().getName());
            String refreshToken = jwtService.generateRefreshToken(user.getLogin(), user.getId());

            AuthResponse authResponse = new AuthResponse(
                    accessToken,
                    refreshToken,
                    user.getId(),
                    user.getLogin(),
                    user.getRole().getName(),
                    jwtExpiration / 1000);

            return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                    .data(authResponse)
                    .status(true)
                    .message("Token refreshed successfully")
                    .build());

        } catch (Exception e) {
            throw new BadRequestException("Invalid or expired refresh token");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userService
                .findByLogin(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "login", username));

        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .data(userMapper.toResponse(user))
                .status(true)
                .message("Current user retrieved successfully")
                .build());
    }
}
