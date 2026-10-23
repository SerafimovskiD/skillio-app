package mk.skillio.dto;

import mk.skillio.enums.Role;

public record AuthResponse(String token, String email, String name, Role role) {
}
