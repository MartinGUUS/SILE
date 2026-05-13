package com.uv.sile.fiee.Repository;

import com.uv.sile.fiee.Entitty.CambioPendiente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CambioPendienteRepository extends JpaRepository<CambioPendiente, Integer> {

    List<CambioPendiente> findByEstadoOrderByCreadoEnDesc(CambioPendiente.EstadoCambio estado);

    List<CambioPendiente> findByIdSolicitanteOrderByCreadoEnDesc(Integer idSolicitante);

    long countByEstado(CambioPendiente.EstadoCambio estado);

    List<CambioPendiente> findByEstadoNotOrderByCreadoEnDesc(CambioPendiente.EstadoCambio estado);
}
