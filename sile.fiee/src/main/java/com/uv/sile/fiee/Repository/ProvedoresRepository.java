package com.uv.sile.fiee.Repository;

import com.uv.sile.fiee.Entitty.Provedores;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProvedoresRepository extends JpaRepository<Provedores, String> {

    // ejemplo de consulta nativa
    @Query(value = "SELECT * FROM provedores WHERE nombre LIKE %:fragmento% OR rfc LIKE %:fragmento2%", nativeQuery = true)
    List<Provedores> buscarPorNombreORfcNativamente(@Param("fragmento") String fragmento,
            @Param("fragmento2") String fragmento2);

}
