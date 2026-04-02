package com.uv.sile.fiee.Repository;

import com.uv.sile.fiee.Entitty.Areas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AreasRepository extends JpaRepository<Areas, String> {

    // ejemplo de consulta nativa
    @Query(value = "SELECT * FROM areas WHERE nombre LIKE %:fragmento%", nativeQuery = true)
    List<Areas> buscarPorNombreNativamente(@Param("fragmento") String fragmento);

}
