package com.uv.sile.fiee.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Leer el header Authorization
        final String authHeader = request.getHeader("Authorization");

        // 2. Si no hay header o no empieza con "Bearer ", dejar pasar sin autenticar
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extraer el token (quitar "Bearer ")
        final String token = authHeader.substring(7);

        try {
            // 4. Extraer el correo del token
            final String correo = jwtService.extractCorreo(token);

            // 5. Si hay correo y no hay autenticación previa en el contexto
            if (correo != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 6. Cargar datos del usuario desde la BD
                UserDetails userDetails = userDetailsService.loadUserByUsername(correo);

                // 7. Validar el token
                if (jwtService.isTokenValid(token, userDetails.getUsername())) {

                    // 8. Crear autenticación y establecerla en el contexto de seguridad
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token inválido o expirado - no autenticar, Spring Security rechazará
            logger.error("Error procesando token JWT: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
