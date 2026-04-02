package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Presentacion;
import com.uv.sile.fiee.Service.PresentacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/presentacion")
@CrossOrigin(origins = "*")
public class PresentacionController {

    @Autowired
    private PresentacionService presentacionService;

    @GetMapping
    public List<Presentacion> getAllPresentaciones() {
        return presentacionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Presentacion> getPresentacionById(@PathVariable String id) {
        Optional<Presentacion> presentacion = presentacionService.findById(id);
        return presentacion.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Presentacion createPresentacion(@RequestBody Presentacion presentacion) {
        return presentacionService.save(presentacion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Presentacion> updatePresentacion(@PathVariable String id,
            @RequestBody Presentacion presentacionDetails) {
        Optional<Presentacion> presentacionOptional = presentacionService.findById(id);
        if (presentacionOptional.isPresent()) {
            Presentacion presentacion = presentacionOptional.get();
            presentacion.setNombre(presentacionDetails.getNombre());
            return ResponseEntity.ok(presentacionService.save(presentacion));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePresentacion(@PathVariable String id) {
        if (presentacionService.findById(id).isPresent()) {
            presentacionService.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
