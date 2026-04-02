package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Lineas;
import com.uv.sile.fiee.Service.LineasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/lineas")
@CrossOrigin(origins = "*")
public class LineasController {

    @Autowired
    private LineasService lineasService;

    @GetMapping
    public List<Lineas> getAllLineas() {
        return lineasService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lineas> getLineaById(@PathVariable String id) {
        Optional<Lineas> linea = lineasService.findById(id);
        return linea.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Lineas createLinea(@RequestBody Lineas lineas) {
        return lineasService.save(lineas);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lineas> updateLinea(@PathVariable String id, @RequestBody Lineas lineasDetails) {
        Optional<Lineas> lineaOptional = lineasService.findById(id);
        if (lineaOptional.isPresent()) {
            Lineas linea = lineaOptional.get();
            linea.setNombre(lineasDetails.getNombre());
            return ResponseEntity.ok(lineasService.save(linea));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLinea(@PathVariable String id) {
        if (lineasService.findById(id).isPresent()) {
            lineasService.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
