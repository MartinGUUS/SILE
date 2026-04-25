package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Asignaciones;
import com.uv.sile.fiee.Service.AsignacionesService;
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
    public Asignaciones createAsignacion(@RequestBody Asignaciones asignaciones) {
        return asignacionesService.save(asignaciones);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asignaciones> updateAsignacion(@PathVariable Integer id,
            @RequestBody Asignaciones asignacionesDetails) {
        Optional<Asignaciones> asignacionOptional = asignacionesService.findById(id);
        if (asignacionOptional.isPresent()) {
            Asignaciones asignacion = asignacionOptional.get();
            asignacion.setFkActivo(asignacionesDetails.getFkActivo());
            asignacion.setFkArea(asignacionesDetails.getFkArea());
            asignacion.setFkResguardante(asignacionesDetails.getFkResguardante());
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
