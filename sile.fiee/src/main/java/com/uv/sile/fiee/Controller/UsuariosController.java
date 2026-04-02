package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Usuarios;
import com.uv.sile.fiee.Service.UsuariosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(path = "/usuarios")
@CrossOrigin(origins = "*") // Permite que Angular (u otro) se conecte
public class UsuariosController {

    @Autowired
    private UsuariosService usuariosService;

    // GET http://localhost:8080/usuarios
    @GetMapping
    public List<Usuarios> getAllUsuarios() {
        return usuariosService.findAll();
    }

    // GET http://localhost:8080/usuarios/1
    @GetMapping("/{id}")
    public ResponseEntity<Usuarios> getUsuarioById(@PathVariable Integer id) {
        Optional<Usuarios> usuario = usuariosService.findById(id);
        if (usuario.isPresent()) {
            return ResponseEntity.ok(usuario.get());
        }
        return ResponseEntity.notFound().build();
    }

    // POST http://localhost:8080/usuarios
    @PostMapping
    public Usuarios crearUsuario(@RequestBody Usuarios usuario) {
        return usuariosService.save(usuario);
    }

    // PUT http://localhost:8080/usuarios/1
    @PutMapping("/{id}")
    public ResponseEntity<Usuarios> actualizarUsuario(@PathVariable Integer id, @RequestBody Usuarios usuarioDetalles) {
        Optional<Usuarios> usuarioOptional = usuariosService.findById(id);
        if (usuarioOptional.isPresent()) {
            Usuarios usuario = usuarioOptional.get();
            usuario.setNombre(usuarioDetalles.getNombre());
            usuario.setApellido(usuarioDetalles.getApellido());
            usuario.setCorreo(usuarioDetalles.getCorreo());
            usuario.setContrasena(usuarioDetalles.getContrasena());
            return ResponseEntity.ok(usuariosService.save(usuario));
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE http://localhost:8080/usuarios/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Integer id) {
        if (usuariosService.findById(id).isPresent()) {
            usuariosService.delete(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
