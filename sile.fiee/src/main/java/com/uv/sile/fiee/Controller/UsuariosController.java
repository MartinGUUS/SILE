package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Usuarios;
import com.uv.sile.fiee.Security.JwtService;
import com.uv.sile.fiee.Service.UsuariosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping(path = "/usuarios")
@CrossOrigin(origins = "*")
public class UsuariosController {

    @Autowired
    private UsuariosService usuariosService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Integer getFkRolFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtService.extractClaim(token, claims -> claims.get("fkRol", Integer.class));
        }
        return null;
    }

    // GET http://localhost:8080/usuarios
    @GetMapping
    public List<Usuarios> getAllUsuarios() {
        return usuariosService.findAll();
    }

    // GET http://localhost:8080/usuarios/1
    @GetMapping("/{id}")
    public ResponseEntity<Usuarios> getUsuarioById(@PathVariable Integer id) {
        Optional<Usuarios> usuario = usuariosService.findById(id);
        if (usuario.isPresent()) {
            return ResponseEntity.ok(usuario.get());
        }
        return ResponseEntity.notFound().build();
    }

    // POST http://localhost:8080/usuarios
    @PostMapping
    public Usuarios crearUsuario(@RequestBody Usuarios usuario) {
        return usuariosService.save(usuario);
    }

    // PUT http://localhost:8080/usuarios/1
    @PutMapping("/{id}")
    public ResponseEntity<Usuarios> actualizarUsuario(@PathVariable Integer id, @RequestBody Usuarios usuarioDetalles) {
        Optional<Usuarios> usuarioOptional = usuariosService.findById(id);
        if (usuarioOptional.isPresent()) {
            Usuarios usuario = usuarioOptional.get();
            usuario.setNombre(usuarioDetalles.getNombre());
            usuario.setApellido(usuarioDetalles.getApellido());
            usuario.setCorreo(usuarioDetalles.getCorreo());
            usuario.setContrasena(usuarioDetalles.getContrasena());
            return ResponseEntity.ok(usuariosService.save(usuario));
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE http://localhost:8080/usuarios/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Integer id) {
        if (usuariosService.findById(id).isPresent()) {
            usuariosService.delete(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // PATCH http://localhost:8080/usuarios/1/estado
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Usuarios> actualizarEstado(@PathVariable Integer id, @RequestBody Map<String, String> updates, HttpServletRequest request) {
        Optional<Usuarios> usuarioOptional = usuariosService.findById(id);
        if (usuarioOptional.isPresent()) {
            Usuarios usuario = usuarioOptional.get();

            // Solo un administrador puede cambiar el rol de otro administrador
            // Nadie puede cambiar el rol del usuario ID=1
            if (updates.containsKey("fkRol")) {
                if (id == 1) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
                }
                Integer fkRolSolicitante = getFkRolFromRequest(request);
                if (usuario.getFkRol() != null && usuario.getFkRol() == 1
                        && (fkRolSolicitante == null || fkRolSolicitante != 1)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(null);
                }
                usuario.setFkRol(Integer.parseInt(updates.get("fkRol")));
            }

            if (updates.containsKey("estado")) {
                usuario.setEstado(updates.get("estado"));
            }
            return ResponseEntity.ok(usuariosService.save(usuario));
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> cambiarPassword(@PathVariable Integer id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        Integer fkRolSolicitante = getFkRolFromRequest(request);
        Integer idSolicitante = extractIdFromRequest(request);

        Optional<Usuarios> usuarioOptional = usuariosService.findById(id);
        if (!usuarioOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Usuarios usuario = usuarioOptional.get();

        boolean permitido = false;
        // Admin ID=1 puede cambiar la contraseña de cualquiera
        if (idSolicitante != null && idSolicitante == 1) {
            permitido = true;
        }
        // Admin puede cambiar contraseña de editores y observadores (no admins)
        else if (fkRolSolicitante != null && fkRolSolicitante == 1
                && usuario.getFkRol() != null && usuario.getFkRol() != 1) {
            permitido = true;
        }

        if (!permitido) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "No tienes permiso para cambiar esta contraseña"));
        }

        if (!body.containsKey("password") || body.get("password").trim().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 6 caracteres"));
        }

        usuario.setContrasena(passwordEncoder.encode(body.get("password")));
        usuariosService.save(usuario);

        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada"));
    }

    private Integer extractIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtService.extractClaim(token, claims -> claims.get("idUsuario", Integer.class));
        }
        return null;
    }
}
