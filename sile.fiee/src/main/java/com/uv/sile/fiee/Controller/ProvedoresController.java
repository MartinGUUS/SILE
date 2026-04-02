package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Provedores;
import com.uv.sile.fiee.Service.ProvedoresService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/provedores")
@CrossOrigin(origins = "*")
public class ProvedoresController {

    @Autowired
    private ProvedoresService provedoresService;

    @GetMapping
    public List<Provedores> getAllProvedores() {
        return provedoresService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Provedores> getProvedorById(@PathVariable String id) {
        Optional<Provedores> provedor = provedoresService.findById(id);
        return provedor.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Provedores createProvedor(@RequestBody Provedores provedores) {
        return provedoresService.save(provedores);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Provedores> updateProvedor(@PathVariable String id,
            @RequestBody Provedores provedoresDetails) {
        Optional<Provedores> provedorOptional = provedoresService.findById(id);
        if (provedorOptional.isPresent()) {
            Provedores provedor = provedorOptional.get();
            provedor.setNombre(provedoresDetails.getNombre());
            return ResponseEntity.ok(provedoresService.save(provedor));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProvedor(@PathVariable String id) {
        if (provedoresService.findById(id).isPresent()) {
            provedoresService.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
