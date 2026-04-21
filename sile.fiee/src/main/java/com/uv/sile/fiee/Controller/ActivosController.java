package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Activos;
import com.uv.sile.fiee.Service.ActivosServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/activos")
@CrossOrigin(origins = "*")
public class ActivosController {

    @Autowired
    private ActivosServices activosService;

    @GetMapping
    public List<Activos> getAllActivos() {
        return activosService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Activos> getActivoById(@PathVariable String id) {
        Optional<Activos> activo = activosService.findById(id);
        return activo.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // localhost:8080/activos
    @PostMapping
    public Activos createActivo(@RequestBody Activos activos) {
        return activosService.save(activos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Activos> updateActivo(@PathVariable String id, @RequestBody Activos activosDetails) {
        Optional<Activos> activoOptional = activosService.findById(id);
        if (activoOptional.isPresent()) {
            Activos activo = activoOptional.get();
            activo.setNombre(activosDetails.getNombre());
            activo.setDescripcion(activosDetails.getDescripcion());
            activo.setPrecio(activosDetails.getPrecio());
            activo.setExistencias(activosDetails.getExistencias());
            activo.setGarantia(activosDetails.getGarantia());
            activo.setNSerie(activosDetails.getNSerie());
            activo.setFkProvedor(activosDetails.getFkProvedor());
            activo.setFkMarca(activosDetails.getFkMarca());
            activo.setFkLinea(activosDetails.getFkLinea());
            activo.setFkPresentacion(activosDetails.getFkPresentacion());
            return ResponseEntity.ok(activosService.save(activo));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivo(@PathVariable String id) {
        if (activosService.findById(id).isPresent()) {
            activosService.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Activos> cambiarEstado(@PathVariable String id, @RequestBody java.util.Map<String, String> updates) {
        Optional<Activos> activoOptional = activosService.findById(id);
        if (activoOptional.isPresent()) {
            Activos activo = activoOptional.get();
            if (updates.containsKey("estado")) {
                activo.setEstado(updates.get("estado"));
            }
            return ResponseEntity.ok(activosService.save(activo));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
