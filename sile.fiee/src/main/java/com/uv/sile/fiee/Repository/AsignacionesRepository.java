package com.uv.sile.fiee.Repository;

import com.uv.sile.fiee.Entitty.Asignaciones;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AsignacionesRepository extends JpaRepository<Asignaciones, Integer> {

    List<Asignaciones> findByFkActivo(String fkActivo);

    // ejemplo de consulta nativa
    @Query(value = "SELECT * FROM asignaciones WHERE fk_activo LIKE %:fragmento%", nativeQuery = true)
    List<Asignaciones> buscarPorFkActivoNativamente(@Param("fragmento") String fragmento);

}
