package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.AuthResponse;
import mk.skillio.dto.LoginRequest;
import mk.skillio.dto.RegisterRequest;
import mk.skillio.enums.Role;
import mk.skillio.exception.BadRequestException;
import mk.skillio.exception.EmailAlreadyExistsException;
import mk.skillio.exception.InvalidCredentialsException;
import mk.skillio.model.Company;
import mk.skillio.model.User;
import mk.skillio.repository.CompanyRepository;
import mk.skillio.repository.UserRepository;
import mk.skillio.security.JwtService;
import mk.skillio.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.role() == Role.ADMIN) {
            throw new BadRequestException("Cannot register as ADMIN");
        }
        if (request.role() == Role.COMPANY && (request.companyName() == null || request.companyName().isBlank())) {
            throw new BadRequestException("Company name is required for role COMPANY");
        }
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setName(request.name().trim());
        userRepository.save(user);

        if (request.role() == Role.COMPANY) {
            Company company = new Company();
            company.setUser(user);
            company.setName(request.companyName().trim());
            companyRepository.save(company);
        }
        String token = jwtService.generateToken(user);
        String companyName = request.role() == Role.COMPANY ? request.companyName().trim() : null;
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole(), companyName);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(user);
        String companyName = user.getRole() == Role.COMPANY
                ? companyRepository.findByUserEmail(user.getEmail()).map(Company::getName).orElse(null)
                : null;
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole(), companyName);
    }
}
