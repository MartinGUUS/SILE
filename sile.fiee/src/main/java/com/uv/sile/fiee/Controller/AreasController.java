package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Areas;
import com.uv.sile.fiee.Service.AreasServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/areas")
@CrossOrigin(origins = "*")
public class AreasController {

    @Autowired
    private AreasServices areasService;

    @GetMapping
    public List<Areas> getAllAreas() {
        return areasService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Areas> getAreaById(@PathVariable String id) {
        Optional<Areas> area = areasService.findById(id);
        return area.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Areas createArea(@RequestBody Areas areas) {
        return areasService.save(areas);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Areas> updateArea(@PathVariable String id, @RequestBody Areas areasDetails) {
        Optional<Areas> areaOptional = areasService.findById(id);
        if (areaOptional.isPresent()) {
            Areas area = areaOptional.get();
            area.setNombre(areasDetails.getNombre());
            area.setDescripcion(areasDetails.getDescripcion());
            return ResponseEntity.ok(areasService.save(area));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArea(@PathVariable String id) {
        if (areasService.findById(id).isPresent()) {
            areasService.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Areas> cambiarEstado(@PathVariable String id, @RequestBody java.util.Map<String, String> updates) {
        Optional<Areas> areaOptional = areasService.findById(id);
        if (areaOptional.isPresent()) {
            Areas area = areaOptional.get();
            if (updates.containsKey("estado")) {
                area.setEstado(updates.get("estado"));
            }
            return ResponseEntity.ok(areasService.save(area));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
