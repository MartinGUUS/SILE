package com.uv.sile.fiee.Service;

import com.uv.sile.fiee.Entitty.Areas;
import com.uv.sile.fiee.Repository.AreasRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AreasServices {

    @Autowired
    private AreasRepository areasRepository;

    public List<Areas> findAll() {
        // Por defecto excluye los borrados lógicamente (estado=3)
        return areasRepository.findByEstadoNot("3");
    }

    public List<Areas> findByEstado(String estado) {
        return areasRepository.findByEstado(estado);
    }

    public Optional<Areas> findById(String id) {
        return areasRepository.findById(id);
    }

    public Areas save(Areas areas) {
        return areasRepository.save(areas);
    }

    public void delete(String id) {
        areasRepository.deleteById(id);
    }

}
