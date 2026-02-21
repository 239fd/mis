package by.bsuir.mis.controller;

import by.bsuir.mis.API.ApiResponse;
import by.bsuir.mis.dto.request.RoleRequest;
import by.bsuir.mis.dto.response.RoleResponse;
import by.bsuir.mis.entity.Role;
import by.bsuir.mis.exception.ResourceAlreadyExistsException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.mapper.RoleMapper;
import by.bsuir.mis.service.RoleService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final RoleMapper roleMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAll() {
        List<RoleResponse> roles =
                roleService.findAll().stream().map(roleMapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.<List<RoleResponse>>builder()
                .data(roles)
                .status(true)
                .message("Roles retrieved successfully")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> getById(@PathVariable UUID id) {
        Role role = roleService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        return ResponseEntity.ok(ApiResponse.<RoleResponse>builder()
                .data(roleMapper.toResponse(role))
                .status(true)
                .message("Role retrieved successfully")
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoleResponse>> create(@Valid @RequestBody RoleRequest request) {
        if (roleService.existsByName(request.name())) {
            throw new ResourceAlreadyExistsException("Role", "name", request.name());
        }

        Role role = Role.builder()
                .name(request.name())
                .description(request.description())
                .build();

        Role saved = roleService.save(role);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<RoleResponse>builder()
                        .data(roleMapper.toResponse(saved))
                        .status(true)
                        .message("Role created successfully")
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody RoleRequest request) {
        Role role = roleService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        if (request.name() != null && !request.name().equals(role.getName())) {
            if (roleService.existsByName(request.name())) {
                throw new ResourceAlreadyExistsException("Role", "name", request.name());
            }
            role.setName(request.name());
        }
        if (request.description() != null) role.setDescription(request.description());

        Role updated = roleService.update(role);
        return ResponseEntity.ok(ApiResponse.<RoleResponse>builder()
                .data(roleMapper.toResponse(updated))
                .status(true)
                .message("Role updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        roleService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Role deleted successfully")
                .build());
    }
}
