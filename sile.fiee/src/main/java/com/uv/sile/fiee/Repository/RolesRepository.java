package com.uv.sile.fiee.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.uv.sile.fiee.Entitty.Roles;

@Repository
public interface RolesRepository extends JpaRepository<Roles, Integer> {
}
