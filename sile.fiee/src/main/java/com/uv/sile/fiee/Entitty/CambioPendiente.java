package com.uv.sile.fiee.Entitty;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cambios_pendientes")
public class CambioPendiente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cambio")
    private Integer idCambio;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cambio", nullable = false)
    private TipoCambio tipoCambio;

    @Column(name = "entidad", nullable = false)
    private String entidad = "activos";

    @Column(name = "id_entidad")
    private String idEntidad;

    @Column(name = "datos_json", columnDefinition = "JSON", nullable = false)
    private String datosJson;

    @Column(name = "id_solicitante", nullable = false)
    private Integer idSolicitante;

    @Column(name = "id_revisor")
    private Integer idRevisor;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoCambio estado = EstadoCambio.PENDIENTE;

    @Column(name = "comentario")
    private String comentario;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", insertable = false, updatable = false)
    private LocalDateTime actualizadoEn;

    public enum TipoCambio { CREAR, ACTUALIZAR, ELIMINAR }
    public enum EstadoCambio { PENDIENTE, APROBADO, RECHAZADO }

    // Getters and Setters
    public Integer getIdCambio() {
        return idCambio;
    }

    public void setIdCambio(Integer idCambio) {
        this.idCambio = idCambio;
    }

    public TipoCambio getTipoCambio() {
        return tipoCambio;
    }

    public void setTipoCambio(TipoCambio tipoCambio) {
        this.tipoCambio = tipoCambio;
    }

    public String getEntidad() {
        return entidad;
    }

    public void setEntidad(String entidad) {
        this.entidad = entidad;
    }

    public String getIdEntidad() {
        return idEntidad;
    }

    public void setIdEntidad(String idEntidad) {
        this.idEntidad = idEntidad;
    }

    public String getDatosJson() {
        return datosJson;
    }

    public void setDatosJson(String datosJson) {
        this.datosJson = datosJson;
    }

    public Integer getIdSolicitante() {
        return idSolicitante;
    }

    public void setIdSolicitante(Integer idSolicitante) {
        this.idSolicitante = idSolicitante;
    }

    public Integer getIdRevisor() {
        return idRevisor;
    }

    public void setIdRevisor(Integer idRevisor) {
        this.idRevisor = idRevisor;
    }

    public EstadoCambio getEstado() {
        return estado;
    }

    public void setEstado(EstadoCambio estado) {
        this.estado = estado;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(LocalDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }

    public LocalDateTime getActualizadoEn() {
        return actualizadoEn;
    }

    public void setActualizadoEn(LocalDateTime actualizadoEn) {
        this.actualizadoEn = actualizadoEn;
    }
}
