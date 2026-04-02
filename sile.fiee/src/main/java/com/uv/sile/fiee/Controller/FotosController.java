package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Fotos;
import com.uv.sile.fiee.Service.FotosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/fotos")
@CrossOrigin(origins = "*")
public class FotosController {

    @Autowired
    private FotosService fotosService;

    @GetMapping
    public List<Fotos> getAllFotos() {
        return fotosService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fotos> getFotoById(@PathVariable Integer id) {
        Optional<Fotos> foto = fotosService.findById(id);
        return foto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Fotos createFoto(@RequestBody Fotos fotos) {
        return fotosService.save(fotos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fotos> updateFoto(@PathVariable Integer id, @RequestBody Fotos fotosDetails) {
        Optional<Fotos> fotoOptional = fotosService.findById(id);
        if (fotoOptional.isPresent()) {
            Fotos foto = fotoOptional.get();
            foto.setFkActivo(fotosDetails.getFkActivo());
            foto.setFoto(fotosDetails.getFoto());
            return ResponseEntity.ok(fotosService.save(foto));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoto(@PathVariable Integer id) {
        if (fotosService.findById(id).isPresent()) {
            fotosService.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
