package mk.skillio.dto;

import mk.skillio.enums.Role;

public record ProfileResponse(Long id, String email, String name, Role role,String location,String bio) {
}
