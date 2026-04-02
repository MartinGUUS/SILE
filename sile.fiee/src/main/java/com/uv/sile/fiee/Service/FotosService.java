package com.uv.sile.fiee.Service;

import com.uv.sile.fiee.Entitty.Fotos;
import com.uv.sile.fiee.Repository.FotosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FotosService {

    @Autowired
    private FotosRepository fotosRepository;

    public List<Fotos> findAll() {
        return fotosRepository.findAll();
    }

    public Optional<Fotos> findById(Integer id) {
        return fotosRepository.findById(id);
    }

    public Fotos save(Fotos fotos) {
        return fotosRepository.save(fotos);
    }

    public void delete(Integer id) {
        fotosRepository.deleteById(id);
    }

}
