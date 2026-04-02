package com.uv.sile.fiee.Repository;

import com.uv.sile.fiee.Entitty.Usuarios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsuariosRepository extends JpaRepository<Usuarios, Integer> {

    // ejemplo
    @Query(value = "SELECT * FROM usuarios WHERE nombre LIKE %:fragmento% OR apellido LIKE %:fragmento2%", nativeQuery = true)
    List<Usuarios> buscarPorNombreOApellidoNativamente(@Param("fragmento") String fragmento,
            @Param("fragmento2") String fragmento2);

}
