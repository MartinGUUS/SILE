package com.uv.sile.fiee.Service;

import com.uv.sile.fiee.Entitty.Provedores;
import com.uv.sile.fiee.Repository.ProvedoresRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProvedoresService {

    @Autowired
    private ProvedoresRepository provedoresRepository;

    public List<Provedores> findAll() {
        return provedoresRepository.findByEstadoNot("3");
    }

    public List<Provedores> findByEstado(String estado) {
        return provedoresRepository.findByEstado(estado);
    }

    public Optional<Provedores> findById(String id) {
        return provedoresRepository.findById(id);
    }

    public Provedores save(Provedores provedores) {
        return provedoresRepository.save(provedores);
    }

    public void delete(String id) {
        provedoresRepository.deleteById(id);
    }

}
