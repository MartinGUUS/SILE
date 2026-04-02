package com.uv.sile.fiee.Service;

import com.uv.sile.fiee.Entitty.Usuarios;
import com.uv.sile.fiee.Repository.UsuariosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuariosService {

    @Autowired
    private UsuariosRepository usuariosRepository;

    public List<Usuarios> findAll() {
        return usuariosRepository.findAll();
    }

    public Optional<Usuarios> findById(Integer id) {
        return usuariosRepository.findById(id);
    }

    public Usuarios save(Usuarios usuarios) {
        return usuariosRepository.save(usuarios);
    }

    public void delete(Integer id) {
        usuariosRepository.deleteById(id);
    }

}
