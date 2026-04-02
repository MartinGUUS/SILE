package com.uv.sile.fiee.Repository;

import com.uv.sile.fiee.Entitty.Marcas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarcasRepository extends JpaRepository<Marcas, String> {

    // ejemplo de consulta nativa
    @Query(value = "SELECT * FROM marcas WHERE nombre LIKE %:fragmento%", nativeQuery = true)
    List<Marcas> buscarPorNombreNativamente(@Param("fragmento") String fragmento);

}
