package com.baresflix.api.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Licor_Ingredientes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LicorIngrediente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_preparacion_licor;


    @ManyToOne
    @JoinColumn(name = "id_licor")
    private Licor licor;


    @ManyToOne
    @JoinColumn(name = "id_ingrediente")
    private Ingrediente ingrediente;
}