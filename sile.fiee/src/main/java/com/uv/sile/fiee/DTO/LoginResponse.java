package com.uv.sile.fiee.DTO;

public class LoginResponse {

    private String token;
    private String nombre;
    private String apellido;
    private String correo;
    private Integer idUsuario;
    private Integer fkRol;

    public LoginResponse() {
    }

    public LoginResponse(String token, String nombre, String apellido, String correo, Integer idUsuario, Integer fkRol) {
        this.token = token;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.idUsuario = idUsuario;
        this.fkRol = fkRol;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Integer getFkRol() {
        return fkRol;
    }

    public void setFkRol(Integer fkRol) {
        this.fkRol = fkRol;
    }
}
