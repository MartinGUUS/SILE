package com.uv.sile.fiee.Repository;

import com.uv.sile.fiee.Entitty.Presentacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PresentacionRepository extends JpaRepository<Presentacion, String> {

    // ejemplo de consulta nativa
    @Query(value = "SELECT * FROM presentacion WHERE nombre LIKE %:fragmento%", nativeQuery = true)
    List<Presentacion> buscarPorNombreNativamente(@Param("fragmento") String fragmento);

}
