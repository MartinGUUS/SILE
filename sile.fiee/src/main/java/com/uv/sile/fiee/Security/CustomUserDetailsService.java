package com.uv.sile.fiee.Security;

import com.uv.sile.fiee.Entitty.Usuarios;
import com.uv.sile.fiee.Repository.UsuariosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuariosRepository usuariosRepository;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuarios usuario = usuariosRepository.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + correo));

        // Asignar rol basado en fk_rol (por defecto ROLE_USER)
        String role = "ROLE_USER";
        if (usuario.getFkRol() != null && usuario.getFkRol() == 1) {
            role = "ROLE_ADMIN";
        }

        return new User(
                usuario.getCorreo(),
                usuario.getContrasena(),
                Collections.singletonList(new SimpleGrantedAuthority(role))
        );
    }
}
