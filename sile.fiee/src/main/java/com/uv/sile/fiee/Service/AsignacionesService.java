package com.uv.sile.fiee.Service;

import com.uv.sile.fiee.Entitty.Asignaciones;
import com.uv.sile.fiee.Repository.AsignacionesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AsignacionesService {

    @Autowired
    private AsignacionesRepository asignacionesRepository;

    public List<Asignaciones> findAll() {
        return asignacionesRepository.findAll();
    }

    public Optional<Asignaciones> findById(Integer id) {
        return asignacionesRepository.findById(id);
    }

    public Asignaciones save(Asignaciones asignaciones) {
        return asignacionesRepository.save(asignaciones);
    }

    public void delete(Integer id) {
        asignacionesRepository.deleteById(id);
    }

}
