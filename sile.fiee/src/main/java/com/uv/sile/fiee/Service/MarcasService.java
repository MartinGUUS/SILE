package com.uv.sile.fiee.Service;

import com.uv.sile.fiee.Entitty.Marcas;
import com.uv.sile.fiee.Repository.MarcasRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MarcasService {

    @Autowired
    private MarcasRepository marcasRepository;

    public List<Marcas> findAll() {
        return marcasRepository.findByEstadoNot("3");
    }

    public List<Marcas> findByEstado(String estado) {
        return marcasRepository.findByEstado(estado);
    }

    public Optional<Marcas> findById(String id) {
        return marcasRepository.findById(id);
    }

    public Marcas save(Marcas marcas) {
        return marcasRepository.save(marcas);
    }

    public void delete(String id) {
        marcasRepository.deleteById(id);
    }

}
