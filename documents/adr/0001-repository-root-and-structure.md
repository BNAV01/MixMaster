# ADR 0001 - Estructura oficial de la raíz del repositorio

## Estado

Aprobado

## Decisión

La raíz actual del repositorio es la base oficial del proyecto. La estructura moderna parte desde:

- `backend/`
- `frontend/`
- `documents/`
- `images/`

No se crea una carpeta contenedora nueva ni una `MixMaster_v2`.

## Consecuencias

- backend y frontend se refactorizan sobre lo ya existente
- documents se vuelve documentación viva
- el árbol `MixMaster/` se conserva como referencia histórica temporal, pero no define la estructura oficial

