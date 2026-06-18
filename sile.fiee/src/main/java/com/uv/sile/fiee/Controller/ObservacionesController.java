package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Observaciones;
import com.uv.sile.fiee.Service.ObservacionesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/observaciones")
@CrossOrigin(origins = "*")
public class ObservacionesController {

    @Autowired
    private ObservacionesService observacionesService;

    @GetMapping
    public List<Observaciones> getAll() {
        return observacionesService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Observaciones> getById(@PathVariable Integer id) {
        Optional<Observaciones> obs = observacionesService.findById(id);
        return obs.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/activo/{id}")
    public List<Observaciones> getByActivo(@PathVariable String id) {
        return observacionesService.findByFkActivo(id);
    }

    @PostMapping
    public Observaciones create(@RequestBody Observaciones observaciones) {
        return observacionesService.save(observaciones);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        Optional<Observaciones> obsOptional = observacionesService.findById(id);
        if (obsOptional.isPresent()) {
            observacionesService.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
