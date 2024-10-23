package com.baresflix.api.models;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "Ingredientes_Coctel")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoctelIngrediente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_preparacion_coctel;


    @ManyToOne
    @JoinColumn(name = "id_coctel")
    private Coctel coctel;


    @ManyToOne
    @JoinColumn(name = "id_ingrediente")
    private Ingrediente ingrediente;


    @ManyToOne
    @JoinColumn(name = "id_licor")
    private Licor licor;

    @Column(length = 50)
    private String cantidad;
}