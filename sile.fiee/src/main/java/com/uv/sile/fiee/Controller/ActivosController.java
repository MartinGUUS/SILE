package com.uv.sile.fiee.Controller;

import com.uv.sile.fiee.Entitty.Activos;
import com.uv.sile.fiee.Entitty.Areas;
import com.uv.sile.fiee.Entitty.Asignaciones;
import com.uv.sile.fiee.Entitty.Marcas;
import com.uv.sile.fiee.Entitty.Resguardantes;
import com.uv.sile.fiee.Entitty.Usuarios;
import com.uv.sile.fiee.Repository.AreasRepository;
import com.uv.sile.fiee.Repository.AsignacionesRepository;
import com.uv.sile.fiee.Repository.MarcasRepository;
import com.uv.sile.fiee.Repository.ResguardantesRepository;
import com.uv.sile.fiee.Repository.UsuariosRepository;
import com.uv.sile.fiee.Security.JwtService;
import com.uv.sile.fiee.Service.ActivosServices;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.AreaReference;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.xssf.usermodel.XSSFTable;
import org.apache.poi.xssf.usermodel.XSSFTableStyleInfo;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/activos")
@CrossOrigin(origins = "*")
public class ActivosController {

    @Autowired
    private ActivosServices activosService;

    @Autowired
    private AsignacionesRepository asignacionesRepository;

    @Autowired
    private AreasRepository areasRepository;

    @Autowired
    private ResguardantesRepository resguardantesRepository;

    @Autowired
    private MarcasRepository marcasRepository;

    @Autowired
    private UsuariosRepository usuariosRepository;

    @Autowired
    private JwtService jwtService;

    private Integer extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtService.extractClaim(token, claims -> claims.get("idUsuario", Integer.class));
        }
        return null;
    }

    @GetMapping
    public List<Activos> getAllActivos(@RequestParam(required = false) String estado) {
        if (estado != null) {
            return activosService.findByEstado(estado);
        }
        return activosService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Activos> getActivoById(@PathVariable String id) {
        Optional<Activos> activo = activosService.findById(id);
        return activo.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // localhost:8080/activos
    @PostMapping
    public Activos createActivo(@RequestBody Activos activos) {
        return activosService.save(activos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Activos> updateActivo(@PathVariable String id, @RequestBody Activos activosDetails, HttpServletRequest request) {
        Optional<Activos> activoOptional = activosService.findById(id);
        if (activoOptional.isPresent()) {
            Activos activo = activoOptional.get();
            activo.setNombre(activosDetails.getNombre());
            activo.setDescripcion(activosDetails.getDescripcion());
            activo.setModelo(activosDetails.getModelo());
            activo.setNSerie(activosDetails.getNSerie());
            activo.setFkMarca(activosDetails.getFkMarca());
            activo.setUltimoActualizadoPor(extractUserId(request));
            return ResponseEntity.ok(activosService.save(activo));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivo(@PathVariable String id) {
        if (activosService.findById(id).isPresent()) {
            activosService.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Activos> cambiarEstado(@PathVariable String id, @RequestBody java.util.Map<String, String> updates, HttpServletRequest request) {
        Optional<Activos> activoOptional = activosService.findById(id);
        if (activoOptional.isPresent()) {
            Activos activo = activoOptional.get();
            if (updates.containsKey("estado")) {
                activo.setEstado(updates.get("estado"));
            }
            activo.setUltimoActualizadoPor(extractUserId(request));
            return ResponseEntity.ok(activosService.save(activo));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/exportar")
    public void exportarExcel(HttpServletResponse response) throws IOException {
        try {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=activos.xlsx");

            List<Activos> activos = activosService.findAll();
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Activos");

        // Estilos
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 11);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);

        // Cabecera
        String[] headers = {"No. Activo","Nombre","Descripción","Modelo","No. Serie","Marca","Estado",
                            "Área","Resguardante","Corresguardante",
                            "Creado por","Actualizado por",
                            "Creado en","Actualizado en"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;
        for (Activos a : activos) {
            Row row = sheet.createRow(rowNum++);

            // Marca
            String marca = "";
            if (a.getFkMarca() != null) {
                Optional<Marcas> m = marcasRepository.findById(a.getFkMarca());
                if (m.isPresent()) marca = a.getFkMarca() + " - " + m.get().getNombre();
                else marca = a.getFkMarca();
            }

            // Estado
            String estado = switch (a.getEstado()) {
                case "1" -> "Activo";
                case "2" -> "Sobrante";
                case "3" -> "Baja";
                case "4" -> "Nuevo";
                case "5" -> "Eliminado";
                default -> a.getEstado() != null ? a.getEstado() : "";
            };

            // Asignación
            String area = "", resguardante = "", coresguardante = "";
            List<Asignaciones> asigs = asignacionesRepository.findByFkActivo(a.getIdActivo());
            if (!asigs.isEmpty()) {
                Asignaciones asig = asigs.get(0);
                if (asig.getFkArea() != null) {
                    Optional<Areas> ar = areasRepository.findById(asig.getFkArea());
                    if (ar.isPresent()) area = asig.getFkArea() + " - " + ar.get().getNombre();
                    else area = asig.getFkArea();
                }
                if (asig.getFkResguardante() != null) {
                    Optional<Resguardantes> rg = resguardantesRepository.findById(asig.getFkResguardante());
                    if (rg.isPresent()) resguardante = asig.getFkResguardante() + " - " + rg.get().getNombres() + " " + rg.get().getApellidos();
                    else resguardante = String.valueOf(asig.getFkResguardante());
                }
                if (asig.getCoresguardante() != null) {
                    Optional<Resguardantes> cg = resguardantesRepository.findById(asig.getCoresguardante());
                    if (cg.isPresent()) coresguardante = asig.getCoresguardante() + " - " + cg.get().getNombres() + " " + cg.get().getApellidos();
                    else coresguardante = String.valueOf(asig.getCoresguardante());
                }
            }

            // Usuario creado por (Activo)
            String creadoPor = "";
            if (a.getCreadoPor() != null) {
                Optional<Usuarios> u = usuariosRepository.findById(a.getCreadoPor());
                if (u.isPresent()) creadoPor = a.getCreadoPor() + " - " + u.get().getNombre() + " " + u.get().getApellido();
                else creadoPor = String.valueOf(a.getCreadoPor());
            }

            // Usuario actualizado por (Activo)
            String actualizadoPor = "";
            if (a.getUltimoActualizadoPor() != null) {
                Optional<Usuarios> u = usuariosRepository.findById(a.getUltimoActualizadoPor());
                if (u.isPresent()) actualizadoPor = a.getUltimoActualizadoPor() + " - " + u.get().getNombre() + " " + u.get().getApellido();
                else actualizadoPor = String.valueOf(a.getUltimoActualizadoPor());
            }

            // Fechas
            String creadoEn = a.getCreadoEn() != null ? a.getCreadoEn().format(dtf) : "";
            String actualizadoEn = a.getActualizadoEn() != null ? a.getActualizadoEn().format(dtf) : "";

            // Escribir fila
            String[] values = {a.getIdActivo(), a.getNombre(), a.getDescripcion(), a.getModelo(),
                               a.getNSerie(), marca, estado, area, resguardante, coresguardante,
                               creadoPor, actualizadoPor,
                               creadoEn, actualizadoEn};
            for (int i = 0; i < values.length; i++) {
                Cell cell = row.createCell(i);
                cell.setCellValue(values[i] != null ? values[i] : "");
                cell.setCellStyle(dataStyle);
            }
        }

        // Auto-ajustar columnas
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Crear tabla de Excel (formato Ctrl+T)
        try {
            AreaReference tableArea = new AreaReference(
                new CellReference(0, 0),
                new CellReference(rowNum - 1, headers.length - 1),
                workbook.getSpreadsheetVersion());
            XSSFTable table = ((XSSFWorkbook) workbook).getSheetAt(0).createTable(tableArea);
            table.setName("Activos");
            table.setDisplayName("Activos");
            table.getCTTable().addNewAutoFilter();
            if (table.getStyle() != null) {
                XSSFTableStyleInfo style = (XSSFTableStyleInfo) table.getStyle();
                style.setName("TableStyleMedium2");
                style.setShowColumnStripes(false);
                style.setShowRowStripes(true);
            }
        } catch (Exception e) {
            // Si falla la creación de la tabla, al menos exportar sin tabla
            e.printStackTrace();
        }

        workbook.write(response.getOutputStream());
        workbook.close();
        } catch (Exception e) {
            e.printStackTrace();
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"Error al generar Excel: " + e.getMessage() + "\"}");
        }
    }
}
