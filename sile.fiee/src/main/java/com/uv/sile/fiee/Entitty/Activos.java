package com.uv.sile.fiee.Entitty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "activos")
public class Activos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_activo")
    private String idActivo;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "precio")
    private Double precio;

    @Column(name = "existencias")
    private Integer existencias;

    @Column(name = "garantia")
    private String garantia;

    @Column(name = "n_serie")
    private String nSerie;

    @Column(name = "fk_provedor")
    private String fkProvedor;

    @Column(name = "fk_marca")
    private String fkMarca;

    @Column(name = "fk_linea")
    private String fkLinea;

    @Column(name = "fk_presentacion")
    private String fkPresentacion;

    @Column(name = "estado")
    private String estado;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", insertable = false, updatable = false)
    private LocalDateTime actualizadoEn;

    @Column(name = "creado_por")
    private Integer creadoPor;

    @Column(name = "ultimo_actualizado_por")
    private Integer ultimoActualizadoPor;

    public Activos() {
    }

    public String getIdActivo() {
        return idActivo;
    }

    public void setIdActivo(String idActivo) {
        this.idActivo = idActivo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    public Integer getExistencias() {
        return existencias;
    }

    public void setExistencias(Integer existencias) {
        this.existencias = existencias;
    }

    public String getGarantia() {
        return garantia;
    }

    public void setGarantia(String garantia) {
        this.garantia = garantia;
    }

    public String getNSerie() {
        return nSerie;
    }

    public void setNSerie(String nSerie) {
        this.nSerie = nSerie;
    }

    public String getFkProvedor() {
        return fkProvedor;
    }

    public void setFkProvedor(String fkProvedor) {
        this.fkProvedor = fkProvedor;
    }

    public String getFkMarca() {
        return fkMarca;
    }

    public void setFkMarca(String fkMarca) {
        this.fkMarca = fkMarca;
    }

    public String getFkLinea() {
        return fkLinea;
    }

    public void setFkLinea(String fkLinea) {
        this.fkLinea = fkLinea;
    }

    public String getFkPresentacion() {
        return fkPresentacion;
    }

    public void setFkPresentacion(String fkPresentacion) {
        this.fkPresentacion = fkPresentacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
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
