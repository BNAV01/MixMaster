package com.baresflix.api.models;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "Preferencias")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Preferencias {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idPreferencia;


    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;


    @ManyToOne
    @JoinColumn(name = "id_licor")
    private Licor licor;

    @ManyToOne
    @JoinColumn(name = "id_coctel")
    private Coctel coctel;

}

