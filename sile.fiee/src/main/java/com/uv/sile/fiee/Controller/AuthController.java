package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.DTO.LoginRequest;
import com.uv.sile.fiee.DTO.LoginResponse;
import com.uv.sile.fiee.Entitty.Usuarios;
import com.uv.sile.fiee.Repository.UsuariosRepository;
import com.uv.sile.fiee.Security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuariosRepository usuariosRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // POST /auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // 1. Autenticar con Spring Security (valida correo + contraseña con BCrypt)
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getCorreo(),
                            request.getContrasena()
                    )
            );

            // 2. Buscar el usuario en la BD
            Usuarios usuario = usuariosRepository.findByCorreo(request.getCorreo())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // 3. Generar token JWT
            String token = jwtService.generateToken(
                    usuario.getCorreo(),
                    usuario.getIdUsuario(),
                    usuario.getFkRol()
            );

            // 4. Devolver respuesta con token y datos del usuario
            LoginResponse response = new LoginResponse(
                    token,
                    usuario.getNombre(),
                    usuario.getApellido(),
                    usuario.getCorreo(),
                    usuario.getIdUsuario()
            );

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Correo o contraseña incorrectos"));
        }
    }

    // POST /auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuarios usuario) {
        try {
            // Verificar si ya existe un usuario con ese correo
            if (usuariosRepository.findByCorreo(usuario.getCorreo()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Ya existe un usuario con ese correo"));
            }

            // Encriptar la contraseña con BCrypt antes de guardar
            usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));

            // Establecer estado activo por defecto (en BD es INT, 1 = activo)
            if (usuario.getEstado() == null) {
                usuario.setEstado("1");
            }

            // Guardar usuario
            Usuarios nuevoUsuario = usuariosRepository.save(usuario);

            // Generar token para el nuevo usuario
            String token = jwtService.generateToken(
                    nuevoUsuario.getCorreo(),
                    nuevoUsuario.getIdUsuario(),
                    nuevoUsuario.getFkRol()
            );

            LoginResponse response = new LoginResponse(
                    token,
                    nuevoUsuario.getNombre(),
                    nuevoUsuario.getApellido(),
                    nuevoUsuario.getCorreo(),
                    nuevoUsuario.getIdUsuario()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Fallo al registrar usuario. Excepción: " + e.getMessage(), 
                            "cause", e.getCause() != null ? e.getCause().toString() : "Unknown"
                    ));
        }
    }
}
