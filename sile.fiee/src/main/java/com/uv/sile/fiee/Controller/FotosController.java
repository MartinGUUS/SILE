package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Fotos;
import com.uv.sile.fiee.Service.FotosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/fotos")
@CrossOrigin(origins = "*")
public class FotosController {

    @Autowired
    private FotosService fotosService;

    @org.springframework.beans.factory.annotation.Value("${file.upload-dir}")
    private String uploadDir;

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
        Optional<Fotos> fotoOptional = fotosService.findById(id);
        if (fotoOptional.isPresent()) {
            Fotos foto = fotoOptional.get();
            String filename = foto.getFoto();
            
            // Borrar archivo físico
            try {
                Path filePath = Paths.get(uploadDir).resolve(filename);
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                e.printStackTrace();
            }
            
            // Borrar de la BD
            fotosService.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/activo/{id}")
    public List<Fotos> getFotosByActivo(@PathVariable String id) {
        return fotosService.findByFkActivo(id);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFoto(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath);

            Map<String, String> response = new HashMap<>();
            response.put("filename", newFilename);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/view/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> getFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, Files.probeContentType(filePath))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
