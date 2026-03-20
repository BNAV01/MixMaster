import {
  AnonymousSessionBootstrapResponse,
  LoyaltySnapshotDto,
  PublishedMenuDto,
  QrContextDto,
  RecommendationResultDto
} from '@mixmaster/shared/api-clients';

const ASSET_BASE = '/assets/consumer';

export interface DemoHistoryMoment {
  id: string;
  stageLabel: string;
  title: string;
  description: string;
  route: string;
  productId?: string;
}

export interface DemoBenefitCard {
  id: string;
  title: string;
  description: string;
  badge: string;
  statusLabel: string;
  pointsCostLabel?: string;
  expiresLabel?: string;
  ctaLabel?: string;
}

export const DEMO_QR_CONTEXT: QrContextDto = {
  qrToken: 'demo-negroni-table-12',
  tenantId: 'tenant-demo',
  branchId: 'branch-bellavista',
  branchName: 'Bellavista Night Bar',
  tableLabel: 'Mesa 12',
  valid: true,
  venueMode: 'table'
};

export const DEMO_ANONYMOUS_SESSION: AnonymousSessionBootstrapResponse = {
  sessionId: 'session-demo-001',
  anonymousProfileId: 'anon-demo-001',
  anonymousToken: 'anon-token-demo',
  tenantId: 'tenant-demo',
  branchId: 'branch-bellavista',
  branchName: 'Bellavista Night Bar',
  tableLabel: 'Mesa 12'
};

export const DEMO_PUBLISHED_MENU: PublishedMenuDto = {
  menuId: 'menu-demo-001',
  versionId: 'menu-version-demo-004',
  branchId: 'branch-bellavista',
  branchName: 'Bellavista Night Bar',
  updatedAt: '2026-03-19T20:45:00Z',
  branding: {
    venueName: 'Bellavista Night Bar',
    descriptor: 'Restobar nocturno con barra de autor, cocina de picoteo y recomendaciones contextuales en tiempo real.',
    logoUrl: `${ASSET_BASE}/venue-logo.svg`,
    heroImageUrl: `${ASSET_BASE}/lounge-hero.svg`,
    address: 'Constitucion 210, Bellavista, Santiago',
    serviceHoursLabel: 'Mie a sab · 18:30 a 02:00',
    ambienceNote: 'Luces tenues, barra central, musica alta moderada y cocina para compartir hasta tarde.',
    serviceModeLabel: 'Mesa, barra y QR contextual',
    heroTags: ['Carta viva', 'Recomendaciones IA', 'Pairings', 'Ambiente nocturno'],
    socialLinks: [
      {
        id: 'instagram',
        type: 'instagram',
        label: 'Instagram',
        handle: '@bellavistanightbar',
        url: 'https://www.instagram.com/'
      },
      {
        id: 'tiktok',
        type: 'tiktok',
        label: 'TikTok',
        handle: '@bellavistanightbar',
        url: 'https://www.tiktok.com/'
      },
      {
        id: 'whatsapp',
        type: 'whatsapp',
        label: 'WhatsApp',
        handle: 'Reservas',
        url: 'https://wa.me/56912345678'
      },
      {
        id: 'web',
        type: 'web',
        label: 'Sitio web',
        handle: 'Reservas y eventos',
        url: 'https://mixmaster.local/demo'
      }
    ]
  },
  highlights: [
    {
      id: 'live-menu',
      title: 'Carta viva',
      description: 'Disponibilidad, pausas y destacados cambian en tiempo real sin romper la navegacion del cliente.'
    },
    {
      id: 'adaptive-recommendations',
      title: 'Recomendacion contextual',
      description: 'La experiencia cruza gustos, historial y momento de consumo para ordenar la carta segun el visitante.'
    },
    {
      id: 'admin-ready',
      title: 'Editable por el local',
      description: 'Categorias, subcategorias, fotos, descripciones, precios y personalizaciones quedan listas para la consola del restaurante.'
    }
  ],
  notes: [
    'La categoria Carta se despliega completa de arriba hacia abajo y respeta el orden definido por el restaurante.',
    'Cada producto puede exponer precio, disponibilidad, descripcion corta, foto y grupos de personalizacion con cobros extra.',
    'La consola administrativa del local debera permitir crear, editar, eliminar y reordenar categorias, subcategorias y campos del menu.'
  ],
  sections: [
    {
      id: 'sec-signature',
      title: 'Signature de la barra',
      subtitle: 'La casa de noche',
      description: 'Recetas propias para arrancar suave, subir intensidad o cerrar la visita con algo mas profundo.',
      itemCount: 4,
      displayOrder: 1,
      subsections: [
        {
          id: 'sub-light-up',
          title: 'Ligeros y citricos',
          subtitle: 'Primera ronda',
          description: 'Alta frescura, final limpio y alcohol contenido para comenzar la noche.',
          displayOrder: 1,
          items: [
            {
              id: 'prod-garden-spritz',
              name: 'Garden Spritz',
              productType: 'cocktail',
              description: 'Espumante brut, aperitivo citrico, albahaca fresca y soda de pomelo. Brilla al inicio y no satura.',
              priceLabel: '$8.900',
              imageUrl: `${ASSET_BASE}/garden-spritz.svg`,
              availabilityState: 'available',
              preparationNote: 'Ideal para abrir mesa o barra.',
              featuredReason: 'Suele funcionar muy bien en perfiles curiosos que no quieren algo pesado.',
              tags: ['citrico', 'herbal', 'low ABV'],
              customizationGroups: [
                {
                  id: 'spritz-sweetness',
                  title: 'Ajusta el perfil',
                  selectionRule: 'Elige 1',
                  options: [
                    { id: 'spritz-dry', label: 'Mas seco', priceDeltaLabel: 'Sin costo' },
                    { id: 'spritz-fruit', label: 'Mas frutal', priceDeltaLabel: '+$700' }
                  ]
                },
                {
                  id: 'spritz-garnish',
                  title: 'Complementos',
                  selectionRule: 'Opcional',
                  options: [
                    { id: 'spritz-basil', label: 'Extra albahaca', priceDeltaLabel: '+$400' },
                    { id: 'spritz-orange', label: 'Lamina de naranja', priceDeltaLabel: 'Sin costo' }
                  ]
                }
              ]
            },
            {
              id: 'prod-yuzu-highball',
              name: 'Yuzu Highball',
              productType: 'cocktail',
              description: 'Whisky liviano, soda helada, yuzu y un giro herbal para una mezcla seca, brillante y facil de repetir.',
              priceLabel: '$9.400',
              imageUrl: `${ASSET_BASE}/yuzu-highball.svg`,
              availabilityState: 'low-stock',
              preparationNote: 'Stock corto por lote de yuzu.',
              featuredReason: 'Aparece alto cuando el perfil pide algo limpio y refrescante.',
              tags: ['seco', 'brillante', 'highball'],
              customizationGroups: [
                {
                  id: 'highball-bubbles',
                  title: 'Burbuja y acabado',
                  selectionRule: 'Elige 1',
                  options: [
                    { id: 'highball-tonic', label: 'Con tonica seca', priceDeltaLabel: 'Sin costo' },
                    { id: 'highball-soda', label: 'Con soda neutra', priceDeltaLabel: 'Sin costo' }
                  ]
                },
                {
                  id: 'highball-upgrades',
                  title: 'Extras',
                  selectionRule: 'Opcional',
                  options: [
                    { id: 'highball-yuzu', label: 'Extra cordial de yuzu', priceDeltaLabel: '+$800' },
                    { id: 'highball-clear-ice', label: 'Hielo premium', priceDeltaLabel: '+$500' }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'sub-after-hours',
          title: 'Oscuros y de cierre',
          subtitle: 'Segunda mitad de la visita',
          description: 'Perfumes amargos, tostados y mas estructura para cuando la noche ya se asentó.',
          displayOrder: 2,
          items: [
            {
              id: 'prod-midnight-negroni',
              name: 'Midnight Negroni',
              productType: 'cocktail',
              description: 'Gin infusionado, bitter italiano, vermut rosso y cacao nibs. Oscuro, elegante y pensado para ir lento.',
              priceLabel: '$10.200',
              imageUrl: `${ASSET_BASE}/midnight-negroni.svg`,
              availabilityState: 'available',
              preparationNote: 'Servido sobre bloque grande de hielo.',
              featuredReason: 'Se recomienda a quienes ya marcaron perfil amargo o quieren subir intensidad.',
              tags: ['amargo', 'stirred', 'intenso'],
              customizationGroups: [
                {
                  id: 'negroni-spirit',
                  title: 'Base preferida',
                  selectionRule: 'Elige 1',
                  options: [
                    { id: 'negroni-gin', label: 'Gin de la casa', priceDeltaLabel: 'Sin costo' },
                    { id: 'negroni-mezcal', label: 'Cambio a mezcal', priceDeltaLabel: '+$1.200' }
                  ]
                }
              ]
            },
            {
              id: 'prod-cacao-espresso-martini',
              name: 'Cacao Espresso Martini',
              productType: 'cocktail',
              description: 'Vodka, licor de cafe, espresso y cacao oscuro para cerrar con textura y energia.',
              priceLabel: '$10.900',
              imageUrl: `${ASSET_BASE}/cacao-espresso.svg`,
              availabilityState: 'paused',
              preparationNote: 'Temporalmente pausado por recarga de cafe frio.',
              featuredReason: 'Funciona muy bien como cierre o transicion post cena.',
              tags: ['cafe', 'cacao', 'postre'],
              customizationGroups: [
                {
                  id: 'espresso-texture',
                  title: 'Textura',
                  selectionRule: 'Elige 1',
                  options: [
                    { id: 'espresso-foam', label: 'Mas espuma', priceDeltaLabel: 'Sin costo' },
                    { id: 'espresso-drier', label: 'Menos dulce', priceDeltaLabel: 'Sin costo' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'sec-classics',
      title: 'Clasicos y relecturas',
      subtitle: 'Barra reconocible',
      description: 'Opciones conocidas para quienes llegan con un favorito claro, pero quieren una version mejor cuidada.',
      itemCount: 2,
      displayOrder: 2,
      subsections: [
        {
          id: 'sub-house-classics',
          title: 'Stirred & short',
          subtitle: 'Concentrados y directos',
          description: 'Preparaciones de barra tradicional con pequeños ajustes de la casa.',
          displayOrder: 1,
          items: [
            {
              id: 'prod-dirty-gibson',
              name: 'Dirty Gibson',
              productType: 'cocktail',
              description: 'Vodka o gin, vermut seco y cebolla perla en una version limpia, salina y muy nocturna.',
              priceLabel: '$9.800',
              imageUrl: `${ASSET_BASE}/midnight-negroni.svg`,
              availabilityState: 'available',
              preparationNote: 'Servido muy frio.',
              tags: ['salino', 'martini', 'clasico'],
              customizationGroups: [
                {
                  id: 'gibson-base',
                  title: 'Base',
                  selectionRule: 'Elige 1',
                  options: [
                    { id: 'gibson-gin', label: 'Con gin', priceDeltaLabel: 'Sin costo' },
                    { id: 'gibson-vodka', label: 'Con vodka', priceDeltaLabel: 'Sin costo' }
                  ]
                }
              ]
            },
            {
              id: 'prod-old-fashioned-house',
              name: 'Old Fashioned de la casa',
              productType: 'cocktail',
              description: 'Bourbon, bitter aromatico y syrup de panela tostada. Redondo, profundo y largo.',
              priceLabel: '$10.500',
              imageUrl: `${ASSET_BASE}/cacao-espresso.svg`,
              availabilityState: 'available',
              preparationNote: 'Opcion para humo ligero en mesa.',
              tags: ['bourbon', 'clasico', 'robusto'],
              customizationGroups: [
                {
                  id: 'of-service',
                  title: 'Servicio',
                  selectionRule: 'Elige 1',
                  options: [
                    { id: 'of-classic', label: 'Clasico', priceDeltaLabel: 'Sin costo' },
                    { id: 'of-smoked', label: 'Con humo ligero', priceDeltaLabel: '+$900' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'sec-zero-proof',
      title: 'Sin alcohol y low ABV',
      subtitle: 'Para alternar sin salir del mood',
      description: 'La carta no se quiebra entre quienes toman alcohol y quienes buscan algo mas ligero o cero.',
      itemCount: 2,
      displayOrder: 3,
      subsections: [
        {
          id: 'sub-zero-proof',
          title: 'Zero proof',
          subtitle: 'Mantener ritmo',
          description: 'Capa visual cuidada y mismo lenguaje de bar, sin castigar el sabor.',
          displayOrder: 1,
          items: [
            {
              id: 'prod-citrus-tonic-zero',
              name: 'Citrus Tonic Zero',
              productType: 'mocktail',
              description: 'Cordiales citricos, tonica seca, romero y hielo claro para una opcion fresca y adulta.',
              priceLabel: '$6.900',
              imageUrl: `${ASSET_BASE}/citrus-tonic.svg`,
              availabilityState: 'available',
              preparationNote: 'Muy pedido en rondas largas.',
              tags: ['zero proof', 'citrico', 'tonic'],
              customizationGroups: [
                {
                  id: 'tonic-zero-acid',
                  title: 'Ajusta el perfil',
                  selectionRule: 'Elige 1',
                  options: [
                    { id: 'tonic-zero-dry', label: 'Mas seco', priceDeltaLabel: 'Sin costo' },
                    { id: 'tonic-zero-sweet', label: 'Mas amable', priceDeltaLabel: 'Sin costo' }
                  ]
                }
              ]
            },
            {
              id: 'prod-ginger-spritz-zero',
              name: 'Ginger Spritz Zero',
              productType: 'mocktail',
              description: 'Jengibre, pomelo rosado, soda y bitter sin alcohol para una sensacion mas festiva.',
              priceLabel: '$7.300',
              imageUrl: `${ASSET_BASE}/garden-spritz.svg`,
              availabilityState: 'available',
              preparationNote: 'Ligero y muy versatil para pairings salados.',
              tags: ['zero proof', 'ginger', 'spritz']
            }
          ]
        }
      ]
    },
    {
      id: 'sec-kitchen',
      title: 'Cocina de barra',
      subtitle: 'Para compartir y maridar',
      description: 'Picoteo, platos frios y calientes pensados para acompanar la curva de la noche.',
      itemCount: 4,
      displayOrder: 4,
      subsections: [
        {
          id: 'sub-cold-bites',
          title: 'Frios y frescos',
          subtitle: 'Primeros bocados',
          description: 'Acidez, crocancia y umami para empujar cocteles citricos y vinos por copa.',
          displayOrder: 1,
          items: [
            {
              id: 'prod-tuna-tostada',
              name: 'Tostada de atun y ají verde',
              productType: 'food',
              description: 'Atun sellado, mayo de ají verde, pepino y furikake sobre pan brioche tostado.',
              priceLabel: '$8.500',
              imageUrl: `${ASSET_BASE}/tuna-tostada.svg`,
              availabilityState: 'available',
              preparationNote: 'Muy buena con highballs y vinos blancos.',
              tags: ['maridaje', 'fresco', 'compartir'],
              customizationGroups: [
                {
                  id: 'tostada-atun-adjustments',
                  title: 'Personaliza',
                  selectionRule: 'Opcional',
                  options: [
                    { id: 'tostada-no-cilantro', label: 'Sin cilantro', priceDeltaLabel: 'Sin costo' },
                    { id: 'tostada-extra-atun', label: 'Extra atun', priceDeltaLabel: '+$1.500' }
                  ]
                }
              ]
            },
            {
              id: 'prod-mushroom-toast',
              name: 'Toast de setas y mantequilla noisette',
              productType: 'food',
              description: 'Pan campesino, setas salteadas, mantequilla avellanada y queso suave para un bocado umami.',
              priceLabel: '$7.500',
              imageUrl: `${ASSET_BASE}/mushroom-toast.svg`,
              availabilityState: 'available',
              preparationNote: 'Sube muy bien con spritzes herbales.',
              tags: ['umami', 'vegetariano', 'toast'],
              customizationGroups: [
                {
                  id: 'toast-adjustments',
                  title: 'Hazlo tuyo',
                  selectionRule: 'Opcional',
                  options: [
                    { id: 'toast-no-cheese', label: 'Sin queso', priceDeltaLabel: 'Sin costo' },
                    { id: 'toast-extra-setas', label: 'Extra setas', priceDeltaLabel: '+$1.000' }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'sub-hot-bites',
          title: 'Calientes para compartir',
          subtitle: 'Mitad de la noche',
          description: 'Texturas mas grasas y salinas para cuando la mesa ya esta instalada.',
          displayOrder: 2,
          items: [
            {
              id: 'prod-truffle-fries',
              name: 'Papas fritas trufadas',
              productType: 'food',
              description: 'Papas crocantes, mayo de ajo, parmesano y aceite de trufa. Comparten bien con toda la carta.',
              priceLabel: '$6.800',
              imageUrl: `${ASSET_BASE}/truffle-fries.svg`,
              availabilityState: 'available',
              preparationNote: 'Llegan rapido y mueven bien el ticket promedio.',
              tags: ['compartir', 'salado', 'caliente'],
              customizationGroups: [
                {
                  id: 'fries-upgrades',
                  title: 'Agrega algo mas',
                  selectionRule: 'Opcional',
                  options: [
                    { id: 'fries-extra-parmesan', label: 'Extra parmesano', priceDeltaLabel: '+$700' },
                    { id: 'fries-spicy-aioli', label: 'Alioli picante', priceDeltaLabel: '+$500' }
                  ]
                }
              ]
            },
            {
              id: 'prod-bao-pork',
              name: 'Bao de panceta glaseada',
              productType: 'food',
              description: 'Panceta cocida lenta, pickle de pepino y mayo de sesame en pan bao tibio.',
              priceLabel: '$8.900',
              imageUrl: `${ASSET_BASE}/truffle-fries.svg`,
              availabilityState: 'low-stock',
              preparationNote: 'Ultimos baos del turno.',
              tags: ['bao', 'dulce-salado', 'hot snack'],
              customizationGroups: [
                {
                  id: 'bao-adjustments',
                  title: 'Personaliza',
                  selectionRule: 'Opcional',
                  options: [
                    { id: 'bao-no-pickle', label: 'Sin pickle', priceDeltaLabel: 'Sin costo' },
                    { id: 'bao-extra-bao', label: 'Sumar una unidad', priceDeltaLabel: '+$3.500' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const DEMO_RECOMMENDATIONS: RecommendationResultDto = {
  resultId: 'reco-demo-001',
  generatedAt: '2026-03-19T20:46:00Z',
  mode: 'hybrid',
  headline: 'Partimos por algo fresco, aromatico y facil de disfrutar, con pairings que siguen tu ritmo de visita.',
  items: [
    {
      productId: 'prod-garden-spritz',
      name: 'Garden Spritz',
      productType: 'cocktail',
      priceLabel: '$8.900',
      imageUrl: `${ASSET_BASE}/garden-spritz.svg`,
      score: 96,
      summary: 'Citric, herbal y ligero. Ideal para empezar sin saturar y muy facil de recomendar a visitantes efimeros.',
      tags: ['fresco', 'citrico', 'ligero'],
      availabilityState: 'available'
    },
    {
      productId: 'prod-yuzu-highball',
      name: 'Yuzu Highball',
      productType: 'cocktail',
      priceLabel: '$9.400',
      imageUrl: `${ASSET_BASE}/yuzu-highball.svg`,
      score: 92,
      summary: 'Seco, brillante y algo mas atrevido, pero todavia muy facil de tomar.',
      tags: ['seco', 'brillante', 'highball'],
      availabilityState: 'low-stock'
    },
    {
      productId: 'prod-mushroom-toast',
      name: 'Toast de setas y mantequilla noisette',
      productType: 'food',
      priceLabel: '$7.500',
      imageUrl: `${ASSET_BASE}/mushroom-toast.svg`,
      score: 90,
      summary: 'Bocado umami que sostiene bien perfiles citricos y herbales y mejora la experiencia de mesa.',
      tags: ['umami', 'maridaje'],
      availabilityState: 'available'
    }
  ]
};

export const DEMO_LOYALTY_SNAPSHOT: LoyaltySnapshotDto = {
  consumerProfileId: 'consumer-profile-demo',
  levelName: 'Amber',
  pointsBalance: 420,
  nextRewardLabel: 'Te faltan 80 pts para desbloquear un upgrade de autor.'
};

export const DEMO_FAVORITE_PRODUCT_IDS = [
  'prod-garden-spritz',
  'prod-midnight-negroni',
  'prod-mushroom-toast'
];

export const DEMO_HISTORY_TIMELINE: DemoHistoryMoment[] = [
  {
    id: 'history-entry-1',
    stageLabel: '19:42',
    title: 'Entraste por QR y marcaste un perfil guiado',
    description: 'El sistema detecto visita de mesa, abrió carta viva y priorizo opciones amigables para comenzar.',
    route: '/experience/session'
  },
  {
    id: 'history-entry-2',
    stageLabel: '19:47',
    title: 'Aceptaste Garden Spritz como primera recomendacion',
    description: 'Se guardo como pick seguro y activaste la posibilidad de repetirlo en futuras visitas.',
    route: '/experience/recommendations',
    productId: 'prod-garden-spritz'
  },
  {
    id: 'history-entry-3',
    stageLabel: '20:11',
    title: 'Abriste pairings y sumaste un toast de setas',
    description: 'La carta cruzo bebida + comida para sugerir un maridaje facil, rapido y rentable para el local.',
    route: '/experience/pairings',
    productId: 'prod-mushroom-toast'
  },
  {
    id: 'history-entry-4',
    stageLabel: '20:38',
    title: 'Exploraste sabores mas intensos para la segunda ronda',
    description: 'El motor de recomendaciones preparo transicion hacia bitters y cocteleria stirred sin empezar de cero.',
    route: '/experience/explore',
    productId: 'prod-midnight-negroni'
  }
];

export const DEMO_BENEFITS: DemoBenefitCard[] = [
  {
    id: 'benefit-welcome-upgrade',
    title: 'Upgrade de bienvenida',
    description: 'Pide un signature y cambia garnish premium o hielo de servicio por cuenta de la casa.',
    badge: 'Activo',
    statusLabel: 'Disponible esta visita',
    pointsCostLabel: '80 pts',
    expiresLabel: 'Vence hoy a las 02:00',
    ctaLabel: 'Aplicar upgrade'
  },
  {
    id: 'benefit-new-category',
    title: 'Explora una categoria nueva',
    description: 'Si eliges una categoria que aun no pruebas, ganas puntos extra y mejoras tu perfil futuro.',
    badge: 'Discovery',
    statusLabel: 'Bonifica exploracion',
    pointsCostLabel: '+40 pts',
    ctaLabel: 'Ver categorias elegibles'
  },
  {
    id: 'benefit-late-night-pairing',
    title: 'Pairing nocturno',
    description: 'Activa descuento en cocina de barra al combinar una recomendacion aprobada con un plato para compartir.',
    badge: 'Mesa',
    statusLabel: 'Listo para canje',
    pointsCostLabel: '$1.500 OFF',
    ctaLabel: 'Ver maridajes'
  }
];

export function enrichPublishedMenuWithDemo(menu: PublishedMenuDto): PublishedMenuDto {
  const hasRichSections = menu.sections.some((section) => section.subsections?.some((subsection) => subsection.items.length));

  if (hasRichSections) {
    return {
      ...DEMO_PUBLISHED_MENU,
      ...menu,
      branding: menu.branding ?? DEMO_PUBLISHED_MENU.branding,
      highlights: menu.highlights ?? DEMO_PUBLISHED_MENU.highlights,
      notes: menu.notes ?? DEMO_PUBLISHED_MENU.notes
    };
  }

  return {
    ...DEMO_PUBLISHED_MENU,
    ...menu,
    sections: DEMO_PUBLISHED_MENU.sections.map((demoSection, index) => {
      const incomingSection = menu.sections[index];

      if (!incomingSection) {
        return demoSection;
      }

      return {
        ...demoSection,
        ...incomingSection,
        subtitle: incomingSection.subtitle ?? demoSection.subtitle,
        description: incomingSection.description ?? demoSection.description,
        subsections: incomingSection.subsections?.length ? incomingSection.subsections : demoSection.subsections
      };
    }),
    branding: menu.branding ?? DEMO_PUBLISHED_MENU.branding,
    highlights: menu.highlights ?? DEMO_PUBLISHED_MENU.highlights,
    notes: menu.notes ?? DEMO_PUBLISHED_MENU.notes
  };
}

export function enrichRecommendationsWithDemo(result: RecommendationResultDto): RecommendationResultDto {
  if (!result.items.length) {
    return DEMO_RECOMMENDATIONS;
  }

  const demoItemsById = new Map(DEMO_RECOMMENDATIONS.items.map((item) => [item.productId, item]));

  return {
    ...DEMO_RECOMMENDATIONS,
    ...result,
    items: result.items.map((item) => {
      const demoItem = demoItemsById.get(item.productId);

      return {
        ...demoItem,
        ...item,
        imageUrl: item.imageUrl ?? demoItem?.imageUrl,
        summary: item.summary || demoItem?.summary || '',
        tags: item.tags.length ? item.tags : demoItem?.tags ?? []
      };
    })
  };
}
