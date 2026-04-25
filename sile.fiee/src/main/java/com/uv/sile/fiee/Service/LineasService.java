package com.uv.sile.fiee.Service;

import com.uv.sile.fiee.Entitty.Lineas;
import com.uv.sile.fiee.Repository.LineasRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LineasService {

    @Autowired
    private LineasRepository lineasRepository;

    public List<Lineas> findAll() {
        return lineasRepository.findByEstadoNot("3");
    }

    public List<Lineas> findByEstado(String estado) {
        return lineasRepository.findByEstado(estado);
    }

    public Optional<Lineas> findById(String id) {
        return lineasRepository.findById(id);
    }

    public Lineas save(Lineas lineas) {
        return lineasRepository.save(lineas);
    }

    public void delete(String id) {
        lineasRepository.deleteById(id);
    }

}
