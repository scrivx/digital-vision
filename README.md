# Digital Vision Test

Herramienta web interactiva de estimación de agudeza visual. Presenta letras tipo Snellen de tamaño progresivamente decreciente y captura las respuestas del usuario por voz. Genera un resultado en formato 20/X con recomendaciones orientativas.

> **Aviso legal:** Este producto es una herramienta de estimación, no un instrumento médico. Los resultados no sustituyen la evaluación clínica de un oftalmólogo u optometrista.

---

## Características

- Test de agudeza visual basado en el estándar Snellen (9 niveles: 20/200 → 20/15)
- Reconocimiento de voz con doble motor: Web Speech API (nativo) y Whisper Tiny (offline via `@xenova/transformers`)
- Calibración de pantalla por referencia física (tarjeta de crédito) para dimensionar las letras con precisión física real
- Flujo guiado completo: Landing → Instrucciones → Calibración → Test → Resultados
- Animaciones con Framer Motion, diseño minimalista health-tech
- Sin backend, sin registro: todo corre en el navegador con `localStorage`

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| UI | React 19.2.4 + TypeScript |
| Estilos | TailwindCSS v4 (`@import "tailwindcss"` + `@theme {}`) |
| Animaciones | Framer Motion 12 |
| Voz (nativo) | Web Speech API |
| Voz (offline) | `@xenova/transformers` — Whisper Tiny |
| Gestor de paquetes | pnpm 10 |

---

## Requisitos previos

- Node.js >= 18
- pnpm >= 9 (`npm i -g pnpm`)

---

## Instalación y arranque

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd digital-vision-test

# 2. Instalar dependencias
pnpm install

# 3. Iniciar servidor de desarrollo
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

> **Windows:** ejecutar siempre desde el terminal nativo de Windows (PowerShell o CMD), no desde bash de WSL/Git Bash. El virtual store de pnpm usa symlinks que requieren que pnpm gestione `NODE_PATH` correctamente.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo con Turbopack |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción (requiere build previo) |
| `pnpm lint` | Linting con ESLint |

---

## Estructura del proyecto

```
digital-vision-test/
├── app/
│   ├── page.tsx              # Landing page
│   ├── instructions/page.tsx # Pantalla de instrucciones
│   ├── calibration/page.tsx  # Calibración interactiva de pantalla
│   ├── test/page.tsx         # Test visual (core)
│   ├── results/page.tsx      # Resultados y recomendaciones
│   ├── layout.tsx            # Layout raíz con fuentes y metadatos
│   └── globals.css           # Variables CSS, @theme Tailwind v4
├── components/
│   ├── ui/                   # Button, Card, Badge (componentes base)
│   └── test/                 # LetterDisplay, VoiceListener, ProgressBar
├── services/
│   ├── visionLogic.ts        # Lógica Snellen, generación de letras, scoring
│   ├── speech.ts             # Web Speech API + normalización en español
│   ├── whisper.ts            # Whisper Tiny via @xenova/transformers
│   ├── unifiedVoice.ts       # Abstracción sobre ambos motores de voz
│   └── calibration.ts        # Calibración DPI por tarjeta de crédito
├── .npmrc                    # shamefully-hoist=true (compatibilidad pnpm)
├── next.config.ts            # Alias webpack para onnxruntime-node / sharp
└── tsconfig.json
```

---

## Flujo de la aplicación

```
Landing → Instrucciones → Calibración → Test → Resultados
```

1. **Landing** — presentación y CTA
2. **Instrucciones** — distancia recomendada, uso del micrófono, cómo cubrir cada ojo
3. **Calibración** — el usuario ajusta un slider hasta que el rectángulo en pantalla coincida con el ancho de su tarjeta de crédito; se calcula `pixelsPerMM` y se guarda en `localStorage` (`dvt_calibration`)
4. **Test** — 9 filas de 5 letras; el usuario dice las letras en voz alta; cada fila se puntúa (pasa con ≥ 3/5 correctas); se detiene al acumular 2 filas consecutivas fallidas
5. **Resultados** — acuidad final en formato 20/X, nivel (Excelente / Buena / Moderada / Reducida / Muy reducida) y recomendaciones; datos en `localStorage` (`dvt_result`)

---

## Motor de reconocimiento de voz

El test usa dos motores en paralelo con fallback automático:

| Motor | Requisito | Ventaja | Limitación |
|---|---|---|---|
| Web Speech API | Chrome / Edge (conexión a internet) | Instantáneo, sin descarga | Solo Chromium; requiere internet |
| Whisper Tiny | Cualquier navegador con WASM | Funciona offline | Descarga ~40 MB la primera vez; latencia ~1-2 s |

El motor Whisper se descarga una sola vez y queda cacheado en el navegador (IndexedDB del runtime de transformers.js).

### Letras del test y normalización

El test usa las letras: `F P T O Z L D E C N`

La normalización reconoce nombres en español:
- `"efe"` → F, `"pe"` → P, `"te"` → T, `"o"` → O, `"ceta"` / `"zeta"` → Z, `"ele"` → L, `"de"` → D, `"e"` → E, `"ce"` / `"se"` → C, `"ene"` → N

---

## Calibración de pantalla

La calibración calcula `pixelsPerMM` a partir del ancho en píxeles que el usuario asigna a la referencia (85.6 mm = ancho estándar de tarjeta de crédito). Con ese valor se calculan los tamaños de letra usando la fórmula óptica del estándar Snellen:

```
altura_mm = 2 × distancia_mm × tan(denominador/4 arcminutos)
```

Si no hay calibración guardada, se usan tamaños de fallback optimizados para ~60 cm de distancia a pantalla de laptop.

---

## Limitaciones conocidas

### Técnicas

- **Web Speech API solo funciona en Chrome y Edge.** Firefox y Safari no implementan la API o la tienen deshabilitada.
- **El motor Whisper descarga ~40 MB** la primera vez. En conexiones lentas el test puede tardar en iniciar.
- **No hay backend.** Los resultados se guardan únicamente en `localStorage` del navegador; se pierden al limpiar datos del navegador.
- **Sin PWA / modo offline completo.** El motor Whisper funciona offline una vez descargado, pero la app no está configurada como PWA (sin `manifest.json` ni service worker).
- **Sin modo oscuro implementado** (previsto en el diseño original, no desarrollado todavía).

### Médicas / de precisión

- La calibración depende de que el usuario ajuste manualmente el slider con una tarjeta física: el margen de error puede ser de ±5–10 mm.
- La distancia de visualización (3 metros por defecto) se asume; el usuario debe verificarla.
- Las condiciones de iluminación de la habitación y el brillo del monitor afectan la percepción real.
- El test **no evalúa** daltonismo, campo visual, presión intraocular ni ningún otro parámetro clínico.
- Los resultados no son equivalentes a un examen optométrico profesional.

### Entorno de desarrollo

- En Windows, pnpm usa symlinks en el virtual store que **no funcionan correctamente desde bash de Git Bash / WSL** si pnpm no gestiona el entorno. Usar siempre PowerShell o CMD.

---

## Variables de entorno

No se requieren variables de entorno para ejecutar el proyecto en desarrollo. El archivo `.env.local` no está incluido porque no hay claves externas.

---

## Despliegue

### Vercel (recomendado)

```bash
pnpm build
# subir a Vercel desde el dashboard o con la CLI
vercel deploy
```

### Docker / servidor propio

```bash
pnpm build
pnpm start          # inicia en puerto 3000
```

> El modelo Whisper se descarga en el navegador del cliente, no en el servidor. No se necesita GPU ni almacenamiento adicional en el servidor.

---

## Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| Azul principal | `#2563EB` | CTAs, acentos |
| Fondo | `#F8FAFC` | Fondo general |
| Texto oscuro | `#0F172A` | Titulares |
| Verde éxito | `#10B981` | Feedback correcto |
| Rojo error | `#EF4444` | Feedback incorrecto |
| Texto secundario | `#475569` | Descripciones |

---

## Licencia

Proyecto privado. Todos los derechos reservados.
