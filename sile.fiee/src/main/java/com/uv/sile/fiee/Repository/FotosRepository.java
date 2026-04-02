package com.uv.sile.fiee.Repository;

import com.uv.sile.fiee.Entitty.Fotos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FotosRepository extends JpaRepository<Fotos, Integer> {

    // ejemplo de consulta nativa
    @Query(value = "SELECT * FROM fotos WHERE fk_activo LIKE %:fragmento%", nativeQuery = true)
    List<Fotos> buscarPorFkActivoNativamente(@Param("fragmento") String fragmento);

}
