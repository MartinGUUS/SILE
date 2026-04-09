package com.uv.sile.fiee.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.uv.sile.fiee.Repository.RolesRepository;
import com.uv.sile.fiee.Entitty.Roles;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class RolesService {

    @Autowired
    private RolesRepository rolesRepository;

    public List<Roles> getAllRoles() {
        return rolesRepository.findAll();
    }

    public Optional<Roles> getRoleById(Integer id) {
        return rolesRepository.findById(id);
    }

    public Roles createRole(Roles role) {
        return rolesRepository.save(role);
    }

    public Roles updateRole(Integer id, Roles roleDetails) {
        Roles role = rolesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + id));

        role.setNombre(roleDetails.getNombre());
        role.setDescripcion(roleDetails.getDescripcion());
        role.setActualizadoEn(LocalDateTime.now());

        return rolesRepository.save(role);
    }

    public void deleteRole(Integer id) {
        Roles role = rolesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + id));
        rolesRepository.delete(role);
    }
}
