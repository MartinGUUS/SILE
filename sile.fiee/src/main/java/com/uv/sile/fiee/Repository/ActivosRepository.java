package com.uv.sile.fiee.Repository;

import com.uv.sile.fiee.Entitty.Activos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivosRepository extends JpaRepository<Activos, String> {

    // ejemplo de consulta nativa
    @Query(value = "SELECT * FROM activos WHERE nombre LIKE %:fragmento% OR descripcion LIKE %:fragmento2%", nativeQuery = true)
    List<Activos> buscarPorNombreODescripcionNativamente(@Param("fragmento") String fragmento,
            @Param("fragmento2") String fragmento2);

    // Retorna activos cuyo estado NO sea el indicado (excluye estado 3 = borrado lógico)
    List<Activos> findByEstadoNot(String estado);

    // Retorna activos por estado exacto
    List<Activos> findByEstado(String estado);

}
