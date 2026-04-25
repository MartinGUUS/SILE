package com.uv.sile.fiee.Service;

import com.uv.sile.fiee.Entitty.Activos;
import com.uv.sile.fiee.Repository.ActivosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ActivosServices {

    @Autowired
    private ActivosRepository activosRepository;

    public List<Activos> findAll() {
        return activosRepository.findByEstadoNot("3");
    }

    public List<Activos> findByEstado(String estado) {
        return activosRepository.findByEstado(estado);
    }

    public Optional<Activos> findById(String id) {
        return activosRepository.findById(id);
    }

    public Activos save(Activos activos) {
        return activosRepository.save(activos);
    }

    public void delete(String id) {
        activosRepository.deleteById(id);
    }

}
