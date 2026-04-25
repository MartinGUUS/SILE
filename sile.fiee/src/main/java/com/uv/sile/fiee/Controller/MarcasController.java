package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Marcas;
import com.uv.sile.fiee.Service.MarcasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/marcas")
@CrossOrigin(origins = "*")
public class MarcasController {

    @Autowired
    private MarcasService marcasService;

    @GetMapping
    public List<Marcas> getAllMarcas(@RequestParam(required = false) String estado) {
        if (estado != null && !estado.equals("3")) {
            return marcasService.findByEstado(estado);
        }
        return marcasService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Marcas> getMarcaById(@PathVariable String id) {
        Optional<Marcas> marca = marcasService.findById(id);
        return marca.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Marcas createMarca(@RequestBody Marcas marcas) {
        return marcasService.save(marcas);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Marcas> updateMarca(@PathVariable String id, @RequestBody Marcas marcasDetails) {
        Optional<Marcas> marcaOptional = marcasService.findById(id);
        if (marcaOptional.isPresent()) {
            Marcas marca = marcaOptional.get();
            marca.setNombre(marcasDetails.getNombre());
            return ResponseEntity.ok(marcasService.save(marca));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMarca(@PathVariable String id) {
        if (marcasService.findById(id).isPresent()) {
            marcasService.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Marcas> cambiarEstado(@PathVariable String id, @RequestBody java.util.Map<String, String> updates) {
        Optional<Marcas> marcaOptional = marcasService.findById(id);
        if (marcaOptional.isPresent()) {
            Marcas marca = marcaOptional.get();
            if (updates.containsKey("estado")) {
                marca.setEstado(updates.get("estado"));
            }
            return ResponseEntity.ok(marcasService.save(marca));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
