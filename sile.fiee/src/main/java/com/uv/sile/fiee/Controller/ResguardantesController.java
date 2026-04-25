package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Resguardantes;
import com.uv.sile.fiee.Service.ResguardantesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/resguardantes")
@CrossOrigin(origins = "*")
public class ResguardantesController {

    @Autowired
    private ResguardantesService resguardantesService;

    @GetMapping
    public List<Resguardantes> getAllResguardantes(@RequestParam(required = false) String estado) {
        if (estado != null && !estado.equals("3")) {
            return resguardantesService.findByEstado(estado);
        }
        return resguardantesService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resguardantes> getResguardanteById(@PathVariable Integer id) {
        Optional<Resguardantes> resguardante = resguardantesService.findById(id);
        return resguardante.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Resguardantes createResguardante(@RequestBody Resguardantes resguardantes) {
        return resguardantesService.save(resguardantes);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resguardantes> updateResguardante(@PathVariable Integer id,
            @RequestBody Resguardantes resguardantesDetails) {
        Optional<Resguardantes> resguardanteOptional = resguardantesService.findById(id);
        if (resguardanteOptional.isPresent()) {
            Resguardantes resguardante = resguardanteOptional.get();
            resguardante.setNombres(resguardantesDetails.getNombres());
            resguardante.setApellidos(resguardantesDetails.getApellidos());
            return ResponseEntity.ok(resguardantesService.save(resguardante));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResguardante(@PathVariable Integer id) {
        if (resguardantesService.findById(id).isPresent()) {
            resguardantesService.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Resguardantes> cambiarEstado(@PathVariable Integer id, @RequestBody java.util.Map<String, String> updates) {
        Optional<Resguardantes> resgOptional = resguardantesService.findById(id);
        if (resgOptional.isPresent()) {
            Resguardantes resg = resgOptional.get();
            if (updates.containsKey("estado")) {
                resg.setEstado(updates.get("estado"));
            }
            return ResponseEntity.ok(resguardantesService.save(resg));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
