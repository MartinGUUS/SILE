package com.uv.sile.fiee.Service;

import com.uv.sile.fiee.Entitty.Observaciones;
import com.uv.sile.fiee.Repository.ObservacionesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ObservacionesService {

    @Autowired
    private ObservacionesRepository observacionesRepository;

    public List<Observaciones> findAll() {
        return observacionesRepository.findAll();
    }

    public Optional<Observaciones> findById(Integer id) {
        return observacionesRepository.findById(id);
    }

    public List<Observaciones> findByFkActivo(String fkActivo) {
        return observacionesRepository.findByFkActivoOrderByCreadoEnDesc(fkActivo);
    }

    public Observaciones save(Observaciones observaciones) {
        return observacionesRepository.save(observaciones);
    }

    public void delete(Integer id) {
        observacionesRepository.deleteById(id);
    }
}
