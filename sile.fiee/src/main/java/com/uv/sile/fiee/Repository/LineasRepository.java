package com.uv.sile.fiee.Repository;

import com.uv.sile.fiee.Entitty.Lineas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LineasRepository extends JpaRepository<Lineas, String> {

    // ejemplo de consulta nativa
    @Query(value = "SELECT * FROM lineas WHERE nombre LIKE %:fragmento%", nativeQuery = true)
    List<Lineas> buscarPorNombreNativamente(@Param("fragmento") String fragmento);

    List<Lineas> findByEstadoNot(String estado);
    List<Lineas> findByEstado(String estado);
}
