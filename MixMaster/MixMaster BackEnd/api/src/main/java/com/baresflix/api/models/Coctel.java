package com.baresflix.api.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Cocteles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coctel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idCoctel;

    @Column(length = 100, nullable = false)
    private String nombreCoctel;

/*    @OneToMany(mappedBy = "coctel")
    private List<CoctelIngrediente> ingredientesCoctel;

    @OneToMany(mappedBy = "coctel")
    private List<Preferencias> preferencias;*/
}
