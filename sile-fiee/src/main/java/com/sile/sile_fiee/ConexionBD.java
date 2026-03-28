package com.sile.sile_fiee;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionBD {

    private static final String HOST = "localhost";
    private static final String PUERTO = "3306";
    private static final String BASE = "SILE";
    private static final String USUARIO = "root";
    private static final String CONTRASE = "admin";

    private static final String URL = "jdbc:mysql://" + HOST + ":" + PUERTO + "/" + BASE
            + "?useSSL=false&serverTimezone=America/Mexico_City&allowPublicKeyRetrieval=true";

    private static Connection conexion = null;

    private ConexionBD() {
    }

    public static Connection getConexion() throws SQLException {
        if (conexion == null || conexion.isClosed()) {
            conexion = DriverManager.getConnection(URL, USUARIO, CONTRASE);
        }
        return conexion;
    }

    public static void cerrarConexion() {
        if (conexion != null) {
            try {
                if (!conexion.isClosed()) {
                    conexion.close();
                }
            } catch (SQLException e) {
                System.err.println("Error al cerrar la conexión: " + e.getMessage());
            } finally {
                conexion = null;
            }
        }
    }
}
