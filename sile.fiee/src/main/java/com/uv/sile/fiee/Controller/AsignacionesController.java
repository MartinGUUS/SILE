package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Asignaciones;
import com.uv.sile.fiee.Security.JwtService;
import com.uv.sile.fiee.Service.AsignacionesService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/asignaciones")
@CrossOrigin(origins = "*")
public class AsignacionesController {

    @Autowired
    private AsignacionesService asignacionesService;

    @Autowired
    private JwtService jwtService;

    private Integer extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtService.extractClaim(token, claims -> claims.get("idUsuario", Integer.class));
        }
        return null;
    }

    @GetMapping
    public List<Asignaciones> getAllAsignaciones() {
        return asignacionesService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asignaciones> getAsignacionById(@PathVariable Integer id) {
        Optional<Asignaciones> asignacion = asignacionesService.findById(id);
        return asignacion.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // localhost:8080/asignaciones
    @PostMapping
    public Asignaciones createAsignacion(@RequestBody Asignaciones asignaciones, HttpServletRequest request) {
        Integer userId = extractUserId(request);
        if (asignaciones.getCreadoPor() == null) asignaciones.setCreadoPor(userId);
        asignaciones.setUltimoActualizadoPor(userId);
        return asignacionesService.save(asignaciones);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asignaciones> updateAsignacion(@PathVariable Integer id,
            @RequestBody Asignaciones asignacionesDetails, HttpServletRequest request) {
        Optional<Asignaciones> asignacionOptional = asignacionesService.findById(id);
        if (asignacionOptional.isPresent()) {
            Asignaciones asignacion = asignacionOptional.get();
            asignacion.setFkActivo(asignacionesDetails.getFkActivo());
            asignacion.setFkArea(asignacionesDetails.getFkArea());
            asignacion.setFkResguardante(asignacionesDetails.getFkResguardante());
            asignacion.setCoresguardante(asignacionesDetails.getCoresguardante());
            asignacion.setUltimoActualizadoPor(extractUserId(request));
            return ResponseEntity.ok(asignacionesService.save(asignacion));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsignacion(@PathVariable Integer id) {
        if (asignacionesService.findById(id).isPresent()) {
            asignacionesService.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/activo/{id}")
    public List<Asignaciones> getAsignacionesByActivo(@PathVariable String id) {
        return asignacionesService.findByFkActivo(id);
    }

}
