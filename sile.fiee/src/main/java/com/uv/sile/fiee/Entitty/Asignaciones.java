package com.uv.sile.fiee.Entitty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "asignaciones")
public class Asignaciones {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignaciones")
    private Integer idAsignaciones;

    @Column(name = "fk_activo")
    private String fkActivo;

    @Column(name = "fk_area")
    private String fkArea;

    @Column(name = "fk_resguardante")
    private Integer fkResguardante;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", insertable = false, updatable = false)
    private LocalDateTime actualizadoEn;

    @Column(name = "creado_por")
    private Integer creadoPor;

    @Column(name = "ultimo_actualizado_por")
    private Integer ultimoActualizadoPor;

    public Asignaciones() {
    }

    public Integer getIdAsignaciones() {
        return idAsignaciones;
    }

    public void setIdAsignaciones(Integer idAsignaciones) {
        this.idAsignaciones = idAsignaciones;
    }

    public String getFkActivo() {
        return fkActivo;
    }

    public void setFkActivo(String fkActivo) {
        this.fkActivo = fkActivo;
    }

    public String getFkArea() {
        return fkArea;
    }

    public void setFkArea(String fkArea) {
        this.fkArea = fkArea;
    }

    public Integer getFkResguardante() {
        return fkResguardante;
    }

    public void setFkResguardante(Integer fkResguardante) {
        this.fkResguardante = fkResguardante;
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

    public Integer getCreadoPor() {
        return creadoPor;
    }

    public void setCreadoPor(Integer creadoPor) {
        this.creadoPor = creadoPor;
    }

    public Integer getUltimoActualizadoPor() {
        return ultimoActualizadoPor;
    }

    public void setUltimoActualizadoPor(Integer ultimoActualizadoPor) {
        this.ultimoActualizadoPor = ultimoActualizadoPor;
    }
}
