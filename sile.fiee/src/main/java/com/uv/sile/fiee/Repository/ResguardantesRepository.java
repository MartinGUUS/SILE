package com.uv.sile.fiee.Repository;

import com.uv.sile.fiee.Entitty.Resguardantes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResguardantesRepository extends JpaRepository<Resguardantes, Integer> {

    // ejemplo de consulta nativa
    @Query(value = "SELECT * FROM resguardantes WHERE nombres LIKE %:fragmento% OR apellidos LIKE %:fragmento2%", nativeQuery = true)
    List<Resguardantes> buscarPorNombreOApellidoNativamente(@Param("fragmento") String fragmento,
            @Param("fragmento2") String fragmento2);

    List<Resguardantes> findByEstadoNot(String estado);
    List<Resguardantes> findByEstado(String estado);
}
