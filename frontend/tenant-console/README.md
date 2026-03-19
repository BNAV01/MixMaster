# Tenant Console

Panel administrativo del tenant para operación de sucursal, carta, disponibilidad, campañas, loyalty y analítica.

## Ejecución local

```bash
cd ..
npm install
cd tenant-console
npm install
npm start
```

Puerto por defecto: `4201`

## Scripts útiles

```bash
npm run build
npm run test
```

## Nota de estructura

`branch-ops` vive dentro de esta app. La navegación principal se organiza por módulos funcionales y reutiliza componentes desde `../libs/`.
Antes de `start`, `build`, `watch` o `test`, la app relinka automaticamente `@angular`, `rxjs` y `tslib` al workspace compartido.
