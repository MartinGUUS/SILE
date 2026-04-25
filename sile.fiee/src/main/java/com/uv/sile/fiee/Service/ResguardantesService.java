package com.uv.sile.fiee.Service;

import com.uv.sile.fiee.Entitty.Resguardantes;
import com.uv.sile.fiee.Repository.ResguardantesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResguardantesService {

    @Autowired
    private ResguardantesRepository resguardantesRepository;

    public List<Resguardantes> findAll() {
        return resguardantesRepository.findByEstadoNot("3");
    }

    public List<Resguardantes> findByEstado(String estado) {
        return resguardantesRepository.findByEstado(estado);
    }

    public Optional<Resguardantes> findById(Integer id) {
        return resguardantesRepository.findById(id);
    }

    public Resguardantes save(Resguardantes resguardantes) {
        return resguardantesRepository.save(resguardantes);
    }

    public void delete(Integer id) {
        resguardantesRepository.deleteById(id);
    }

}
