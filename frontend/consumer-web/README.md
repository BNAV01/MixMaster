# Consumer Web

Experiencia pública mobile-first del producto MixMaster.

## Alcance

- entrada por QR
- sesión anónima
- recomendaciones y exploración
- feedback
- login, registro, favoritos, historial y beneficios
- preparada para SSR

## Ejecución local

```bash
cd ..
npm install
cd consumer-web
npm install
npm start
```

Puerto por defecto: `4200`

## Scripts útiles

```bash
npm run build
npm run test
npm run serve:ssr:consumer-web
```

## Nota de estructura

Las pantallas viven en `src/app/features/*` y consumen base compartida desde `../libs/`.
Antes de `start`, `build`, `watch` o `test`, la app relinka automaticamente `@angular`, `rxjs` y `tslib` al workspace compartido.
