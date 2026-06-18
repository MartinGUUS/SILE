package com.uv.sile.fiee.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.uv.sile.fiee.Entitty.Activos;
import com.uv.sile.fiee.Entitty.Asignaciones;
import com.uv.sile.fiee.Entitty.CambioPendiente;
import com.uv.sile.fiee.Entitty.Fotos;
import com.uv.sile.fiee.Repository.ActivosRepository;
import com.uv.sile.fiee.Repository.AsignacionesRepository;
import com.uv.sile.fiee.Repository.CambioPendienteRepository;
import com.uv.sile.fiee.Repository.FotosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CambioPendienteService {

    @Autowired
    private CambioPendienteRepository cambioPendienteRepository;

    @Autowired
    private ActivosRepository activosRepository;

    @Autowired
    private AsignacionesRepository asignacionesRepository;

    @Autowired
    private FotosRepository fotosRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public CambioPendiente crearSolicitud(CambioPendiente.TipoCambio tipoCambio, String idEntidad, String datosJson, Integer idSolicitante) {
        CambioPendiente cambio = new CambioPendiente();
        cambio.setTipoCambio(tipoCambio);
        cambio.setIdEntidad(idEntidad);
        cambio.setDatosJson(datosJson);
        cambio.setIdSolicitante(idSolicitante);
        cambio.setEstado(CambioPendiente.EstadoCambio.PENDIENTE);
        return cambioPendienteRepository.save(cambio);
    }

    public List<CambioPendiente> listarPendientes() {
        return cambioPendienteRepository.findByEstadoOrderByCreadoEnDesc(CambioPendiente.EstadoCambio.PENDIENTE);
    }

    public List<CambioPendiente> listarProcesados() {
        return cambioPendienteRepository.findByEstadoNotOrderByCreadoEnDesc(CambioPendiente.EstadoCambio.PENDIENTE);
    }

    public long contarPendientes() {
        return cambioPendienteRepository.countByEstado(CambioPendiente.EstadoCambio.PENDIENTE);
    }

    public List<CambioPendiente> listarPorSolicitante(Integer idSolicitante) {
        return cambioPendienteRepository.findByIdSolicitanteOrderByCreadoEnDesc(idSolicitante);
    }

    @Transactional
    public CambioPendiente aprobarCambio(Integer idCambio, Integer idRevisor) {
        CambioPendiente cambio = cambioPendienteRepository.findById(idCambio)
                .orElseThrow(() -> new RuntimeException("Cambio no encontrado"));

        if (cambio.getEstado() != CambioPendiente.EstadoCambio.PENDIENTE) {
            throw new RuntimeException("El cambio no está pendiente");
        }

        try {
            JsonNode json = objectMapper.readTree(cambio.getDatosJson());
            Map<String, Object> estadoAnterior = new HashMap<>();
            String idActivoObj = getTextFromJson(json, "idActivo");

            switch (cambio.getTipoCambio()) {
                case CREAR:
                    // No hay estado anterior para una creación
                    break;
                case ACTUALIZAR:
                case ELIMINAR:
                    // Capturar estado anterior antes de aplicar cambios
                    if (idActivoObj != null) {
                        Optional<Activos> optAnterior = activosRepository.findById(idActivoObj);
                        if (optAnterior.isPresent()) {
                            estadoAnterior = objectMapper.convertValue(optAnterior.get(), Map.class);
                            List<Asignaciones> asigsAnteriores = asignacionesRepository.findByFkActivo(idActivoObj);
                            if (!asigsAnteriores.isEmpty()) {
                                estadoAnterior.put("fkArea", asigsAnteriores.get(0).getFkArea());
                                estadoAnterior.put("fkResguardante", asigsAnteriores.get(0).getFkResguardante());
                                estadoAnterior.put("coresguardante", asigsAnteriores.get(0).getCoresguardante());
                            }
                        }
                    }
                    break;
            }

            switch (cambio.getTipoCambio()) {
                case CREAR:
                case ACTUALIZAR:
                    Activos activo = objectMapper.treeToValue(json, Activos.class);

                    // Asegurar campos requeridos
                    if (cambio.getTipoCambio() == CambioPendiente.TipoCambio.CREAR) {
                        if (activo.getEstado() == null || activo.getEstado().isEmpty()) {
                            activo.setEstado("1");
                        }
                        activo.setCreadoPor(idRevisor);
                    }
                    activo.setUltimoActualizadoPor(idRevisor);

                    activosRepository.save(activo);

                    // Manejar asignación (puede tener solo área, solo resguardante, ambos o ninguno)
                    String fkArea = getTextFromJson(json, "fkArea");
                    String fkResguardanteStr = getTextFromJson(json, "fkResguardante");

                    boolean hasArea = fkArea != null && !fkArea.isEmpty();
                    boolean hasResguardante = fkResguardanteStr != null && !fkResguardanteStr.isEmpty();

                    String coresguardanteStr = getTextFromJson(json, "coresguardante");
                    boolean hasCoresguardante = coresguardanteStr != null && !coresguardanteStr.isEmpty();

                    if (hasArea || hasResguardante || hasCoresguardante) {
                        Integer fkResguardante = null;
                        if (hasResguardante) {
                            try {
                                fkResguardante = Integer.parseInt(fkResguardanteStr);
                            } catch (NumberFormatException e) {
                                fkResguardante = null;
                            }
                        }
                        Integer coresguardante = null;
                        if (hasCoresguardante) {
                            try {
                                coresguardante = Integer.parseInt(coresguardanteStr);
                            } catch (NumberFormatException e) {
                                coresguardante = null;
                            }
                        }
                        String effectiveArea = hasArea ? fkArea : null;

                        List<Asignaciones> asigs = asignacionesRepository.findByFkActivo(activo.getIdActivo());
                        if (!asigs.isEmpty()) {
                            Asignaciones asig = asigs.get(0);
                            if (hasArea) asig.setFkArea(effectiveArea);
                            if (hasResguardante || hasCoresguardante) {
                                if (hasResguardante) asig.setFkResguardante(fkResguardante);
                                if (hasCoresguardante) asig.setCoresguardante(coresguardante);
                            }
                            asig.setUltimoActualizadoPor(idRevisor);
                            asignacionesRepository.save(asig);
                        } else {
                            Asignaciones newAsig = new Asignaciones();
                            newAsig.setFkActivo(activo.getIdActivo());
                            newAsig.setFkArea(effectiveArea);
                            newAsig.setFkResguardante(fkResguardante);
                            newAsig.setCoresguardante(coresguardante);
                            newAsig.setEstado("1");
                            newAsig.setCreadoPor(idRevisor);
                            newAsig.setUltimoActualizadoPor(idRevisor);
                            asignacionesRepository.save(newAsig);
                        }
                    }

                    // Manejar fotos (los nombres de archivo vienen en _fotosFilenames)
                    if (json.has("_fotosFilenames") && json.get("_fotosFilenames").isArray()) {
                        for (JsonNode filename : json.get("_fotosFilenames")) {
                            Fotos foto = new Fotos();
                            foto.setFkActivo(activo.getIdActivo());
                            foto.setFoto(filename.asText());
                            foto.setEstado("1");
                            foto.setCreadoPor(idRevisor);
                            foto.setUltimoActualizadoPor(idRevisor);
                            fotosRepository.save(foto);
                        }
                    }

                    // Manejar fotos eliminadas (_fotosEliminadas)
                    if (json.has("_fotosEliminadas") && json.get("_fotosEliminadas").isArray()) {
                        for (JsonNode idFotoNode : json.get("_fotosEliminadas")) {
                            fotosRepository.deleteById(idFotoNode.asInt());
                        }
                    }

                    break;
                case ELIMINAR:
                    Activos activoEliminar = objectMapper.treeToValue(json, Activos.class);
                    activoEliminar.setEstado("3");
                    activosRepository.save(activoEliminar);
                    break;
            }

            // Guardar estado anterior en el JSON para que el frontend pueda mostrar el diff
            if (!estadoAnterior.isEmpty()) {
                ObjectNode root = (ObjectNode) objectMapper.readTree(cambio.getDatosJson());
                root.set("_estadoAnterior", objectMapper.valueToTree(estadoAnterior));
                cambio.setDatosJson(objectMapper.writeValueAsString(root));
            }

            cambio.setEstado(CambioPendiente.EstadoCambio.APROBADO);
            cambio.setIdRevisor(idRevisor);
            return cambioPendienteRepository.save(cambio);

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al procesar JSON: " + e.getMessage(), e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error interno al aprobar cambio: " + e.getMessage(), e);
        }
    }

    public CambioPendiente rechazarCambio(Integer idCambio, Integer idRevisor, String comentario) {
        CambioPendiente cambio = cambioPendienteRepository.findById(idCambio)
                .orElseThrow(() -> new RuntimeException("Cambio no encontrado"));

        if (cambio.getEstado() != CambioPendiente.EstadoCambio.PENDIENTE) {
            throw new RuntimeException("El cambio no está pendiente");
        }

        cambio.setEstado(CambioPendiente.EstadoCambio.RECHAZADO);
        cambio.setIdRevisor(idRevisor);
        cambio.setComentario(comentario);
        return cambioPendienteRepository.save(cambio);
    }

    private String getTextFromJson(JsonNode json, String field) {
        if (json.has(field) && !json.get(field).isNull()) {
            String val = json.get(field).asText();
            return "null".equals(val) ? null : val;
        }
        return null;
    }
}
