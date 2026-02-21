package by.bsuir.mis.controller;

import by.bsuir.mis.API.ApiResponse;
import by.bsuir.mis.dto.request.UserCreateRequest;
import by.bsuir.mis.dto.request.UserUpdateRequest;
import by.bsuir.mis.dto.response.UserResponse;
import by.bsuir.mis.entity.Role;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.exception.ResourceAlreadyExistsException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.mapper.UserMapper;
import by.bsuir.mis.service.RoleService;
import by.bsuir.mis.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final RoleService roleService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll() {
        List<UserResponse> users =
                userService.findAll().stream().map(userMapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .data(users)
                .status(true)
                .message("Users retrieved successfully")
                .build());
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllActive() {
        List<UserResponse> users =
                userService.findAllActive().stream().map(userMapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .data(users)
                .status(true)
                .message("Active users retrieved successfully")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable UUID id) {
        User user = userService.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .data(userMapper.toResponse(user))
                .status(true)
                .message("User retrieved successfully")
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody UserCreateRequest request) {
        if (userService.existsByLogin(request.login())) {
            throw new ResourceAlreadyExistsException("User", "login", request.login());
        }

        Role role = roleService
                .findByName(request.roleName())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", request.roleName()));

        User user = User.builder()
                .login(request.login())
                .passwordHash(passwordEncoder.encode(request.password()))
                .email(request.email())
                .phone(request.phone())
                .role(role)
                .build();

        User saved = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<UserResponse>builder()
                        .data(userMapper.toResponse(saved))
                        .status(true)
                        .message("User created successfully")
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody UserUpdateRequest request) {
        User user = userService.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.password() != null) user.setPasswordHash(passwordEncoder.encode(request.password()));
        if (request.email() != null) user.setEmail(request.email());
        if (request.phone() != null) user.setPhone(request.phone());
        if (request.isActive() != null) user.setIsActive(request.isActive());
        if (request.roleId() != null) {
            Role role = roleService
                    .findById(request.roleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.roleId()));
            user.setRole(role);
        }

        User updated = userService.update(user);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .data(userMapper.toResponse(updated))
                .status(true)
                .message("User updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        userService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("User deleted successfully")
                .build());
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id) {
        userService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("User deactivated successfully")
                .build());
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable UUID id) {
        userService.activate(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("User activated successfully")
                .build());
    }
}
