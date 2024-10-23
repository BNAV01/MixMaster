package com.baresflix.api.models;

import lombok.*;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "Licores")
@Data
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Licor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idLicor;

    @Column(length = 100, nullable = false)
    private String nombreLicor;

    @Column(length = 50)
    private String tipo;

/*    @OneToMany(mappedBy = "licor")
    private List<Preferencias> preferencias;

    @OneToMany(mappedBy = "licor")
    private List<CoctelIngrediente> coctelIngredientes;

    @OneToMany(mappedBy = "licor")
    private List<LicorIngrediente> licorIngredientes;*/
}