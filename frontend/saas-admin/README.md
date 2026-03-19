# SaaS Admin

Panel de superadmin MixMaster para tenants, trials, planes, suscripciones, onboarding, soporte y feature flags.

## Ejecución local

```bash
cd ..
npm install
cd saas-admin
npm install
npm start
```

Puerto por defecto: `4202`

## Scripts útiles

```bash
npm run build
npm run test
```

## Nota de estructura

La app mantiene separación por consola SaaS y consume base compartida desde `../libs/`.
Antes de `start`, `build`, `watch` o `test`, la app relinka automaticamente `@angular`, `rxjs` y `tslib` al workspace compartido.
