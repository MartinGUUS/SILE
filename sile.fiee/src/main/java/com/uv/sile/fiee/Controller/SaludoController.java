package com.uv.sile.fiee.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/apisaludos")
public class SaludoController {

    @GetMapping("/saludo")
    public String saludo() {
        return "hola mundo";
    }


    @GetMapping("/holanombre/{nombre}/{edad}")
    public String holaMundoNombre(@PathVariable String nombre, @PathVariable int edad) {

        return "Eres " + nombre + " y tienes " + edad + " años";
    }

}
