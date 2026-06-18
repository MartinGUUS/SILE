package com.uv.sile.fiee.Repository;

import com.uv.sile.fiee.Entitty.Observaciones;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObservacionesRepository extends JpaRepository<Observaciones, Integer> {

    List<Observaciones> findByFkActivoOrderByCreadoEnDesc(String fkActivo);
}
