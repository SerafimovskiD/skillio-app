package mk.skillio.service;

import mk.skillio.dto.AuthResponse;
import mk.skillio.dto.LoginRequest;
import mk.skillio.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
