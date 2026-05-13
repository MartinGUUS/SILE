package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.CambioPendiente;
import com.uv.sile.fiee.Security.JwtService;
import com.uv.sile.fiee.Service.CambioPendienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cambios")
public class CambioPendienteController {

    @Autowired
    private CambioPendienteService cambioPendienteService;

    @Autowired
    private JwtService jwtService;

    private Integer getIdUsuarioFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtService.extractClaim(token, claims -> claims.get("idUsuario", Integer.class));
        }
        throw new RuntimeException("No token found");
    }

    @PostMapping
    public ResponseEntity<CambioPendiente> crearSolicitud(@RequestBody Map<String, String> body, HttpServletRequest request) {
        Integer idSolicitante = getIdUsuarioFromRequest(request);
        CambioPendiente.TipoCambio tipoCambio = CambioPendiente.TipoCambio.valueOf(body.get("tipoCambio"));
        String idEntidad = body.get("idEntidad");
        String datosJson = body.get("datosJson");

        CambioPendiente cambio = cambioPendienteService.crearSolicitud(tipoCambio, idEntidad, datosJson, idSolicitante);
        return ResponseEntity.status(HttpStatus.CREATED).body(cambio);
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<CambioPendiente>> listarPendientes() {
        return ResponseEntity.ok(cambioPendienteService.listarPendientes());
    }

    @GetMapping("/pendientes/count")
    public ResponseEntity<Long> contarPendientes() {
        return ResponseEntity.ok(cambioPendienteService.contarPendientes());
    }

    @GetMapping("/procesados")
    public ResponseEntity<List<CambioPendiente>> listarProcesados() {
        return ResponseEntity.ok(cambioPendienteService.listarProcesados());
    }

    @GetMapping("/mis-solicitudes")
    public ResponseEntity<List<CambioPendiente>> listarMisSolicitudes(HttpServletRequest request) {
        Integer idSolicitante = getIdUsuarioFromRequest(request);
        return ResponseEntity.ok(cambioPendienteService.listarPorSolicitante(idSolicitante));
    }

    @PutMapping("/{id}/aprobar")
    public ResponseEntity<CambioPendiente> aprobarCambio(@PathVariable Integer id, HttpServletRequest request) {
        Integer idRevisor = getIdUsuarioFromRequest(request);
        CambioPendiente cambio = cambioPendienteService.aprobarCambio(id, idRevisor);
        return ResponseEntity.ok(cambio);
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<CambioPendiente> rechazarCambio(@PathVariable Integer id, @RequestBody(required = false) Map<String, String> body, HttpServletRequest request) {
        Integer idRevisor = getIdUsuarioFromRequest(request);
        String comentario = (body != null && body.containsKey("comentario")) ? body.get("comentario") : null;
        CambioPendiente cambio = cambioPendienteService.rechazarCambio(id, idRevisor, comentario);
        return ResponseEntity.ok(cambio);
    }
}
