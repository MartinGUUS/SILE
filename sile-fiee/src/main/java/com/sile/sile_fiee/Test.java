package com.sile.sile_fiee;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class Test {
    public static void main(String[] args) {

        System.out.println("Conectando a MySQL...");

        try {
            Connection conn = ConexionBD.getConexion();
            Statement stmt = conn.createStatement();

            // SELECT de todos los usuarios
            ResultSet rs = stmt.executeQuery("SELECT * FROM usuarios");

            System.out.println("\n--- USUARIOS ---");
            while (rs.next()) {
                int id = rs.getInt("id_usuario");
                String nombre = rs.getString("nombre");
                String apellido = rs.getString("apellido");
                String correo = rs.getString("correo");
                String creadoEn = rs.getString("creado_en");

                System.out.println(
                        "ID: " + id +
                                " | Nombre: " + nombre +
                                " | Apellido: " + apellido +
                                " | Correo: " + correo +
                                " | Creado: " + creadoEn);
            }
            System.out.println("----------------");

        } catch (SQLException e) {
            System.err.println("Error de conexión: " + e.getMessage());
            System.err.println("Código SQL: " + e.getSQLState());
        } finally {
            ConexionBD.cerrarConexion();
        }
    }
}
