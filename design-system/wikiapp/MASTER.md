# Design System Master File — WikiApp TDF — Información al día

> **IDENTIDAD TERRITORIAL:** Portal público y gratuito de información al día de Tierra del Fuego, Antártida e Islas del Atlántico Sur ("Fin del Mundo"). Se descarta cualquier lenguaje de "servicios exclusivos", "lujo" o "WA PRO".

---

**Project:** WikiApp TDF — Información al día
**Category:** Portal Cívico Territorial, Noticias Regionales, Estado de Rutas y Alertas Oficiales
**Iconography:** Monolineal consistente (`stroke-width: 1.5px`), sin emojis decorativos sueltos.

---

## Global Rules

### Paleta de Colores (Tokens Semánticos, No Decorativos)

| Token | Rol Semántico | Modo Claro | Modo Oscuro |
|-------|---------------|------------|-------------|
| `--color-surface-primary` | Lienzo principal de lectura | `#F8FAFC` | `#0B0F17` |
| `--color-surface-elevated` | Tarjetas, franja fija y contenedores | `#FFFFFF` | `#111827` |
| `--color-surface-sunken` | Chips inactivos y fondos secundarios | `#F1F5F9` | `#1E293B` |
| `--color-text-primary` | Títulos y lectura principal | `#0F172A` | `#F8FAFC` |
| `--color-text-secondary` | Subtítulos, copetes y metadatos | `#334155` | `#CBD5E1` |
| `--color-text-tertiary` | Horas tabulares y trazabilidad | `#64748B` | `#94A3B8` |
| `--color-brand-primary` | Identidad territorial (Canal Beagle / Atlántico Sur) | `#0F4C81` | `#38BDF8` |
| `--color-alert-critical` | Alerta Crítica (corte de ruta / ráfagas >85 km/h) | `#DC2626` (Fondo `#FEF2F2`) | `#F87171` (Fondo `rgba(220,38,38,0.16)`) |
| `--color-alert-warning` | Alerta Precaución (hielo / cubiertas obligatorias) | `#D97706` (Fondo `#FFFBEB`) | `#FBBF24` (Fondo `rgba(217,119,6,0.16)`) |
| `--color-alert-info` | Aviso Informativo (trámites, becas, horarios) | `#0284C7` (Fondo `#F0F9FF`) | `#38BDF8` (Fondo `rgba(2,132,199,0.15)`) |
| `--color-status-ok` | Ruta habilitada / Sin alertas vigentes | `#16A34A` (Fondo `#F0FDF4`) | `#4ADE80` (Fondo `rgba(22,163,74,0.15)`) |

### Tipografía

- **Familia única:** `Inter` (`--font-inter`), sans-serif de alta legibilidad en pantalla con soporte nativo de números tabulares (`font-variant-numeric: tabular-nums`) para horarios, rutas y métricas climáticas.
- **Tres pesos únicamente:**
  - Regular (`400`) — Cuerpo de notas y descripciones
  - Semibold (`600`) — Subtítulos, chips, etiquetas de fuente y tarjetas Nivel 2
  - Bold (`700`) — Titulares de Nivel 1 y alertas críticas
- **Escala tipográfica estandarizada:**
  - `24px` (`1.5rem`) — Titular Nivel 1 (Destacada de la franja horaria)
  - `20px` (`1.25rem`) — Encabezados de sección y titular destacado en móvil
  - `16px` (`1rem`) — Títulos de tarjetas locales Nivel 2 y cuerpo de lectura
  - `14px` (`0.875rem`) — Resúmenes, cables Nivel 3 e indicadores de la franja superior
  - `12px` (`0.75rem`) — Metadatos, fuentes agrupadas, trazabilidad ("Sincronizado:") y chips
- **Interlineado:** `1.4` a `1.5` en cuerpo de texto para lectura ágil sin fatiga visual.

### Logo e Identidad Visual

- **Símbolo:** Ícono monolineal (`1.5px` de trazo) que integra un **faro austral / rosa de los vientos** ("Fin del Mundo") con **ondas de señal/alerta**, legible desde `32px` (favicon) hasta `512px` (ícono de app móvil).
- **Denominación oficial:** `WikiApp TDF — Información al día` (se abandona el badge `"WA PRO"`).
- **Categorías temáticas:** Íconos lineales `outline` de `1.5px` de trazo para cada categoría (sin emojis sueltos).

---

## Arquitectura de Lectura y Alertas

1. **Franja de Estado Fija (Sticky Top Bar):**
   - Siempre visible en la parte superior con tres indicadores simultáneos:
     1. **Estado de Ruta 3** (ícono + semáforo semántico + fuente oficial).
     2. **Alerta activa de Defensa Civil** (o `"Sin alertas"`).
     3. **Farmacia de turno** de la ciudad detectada por geolocalización o elegida por el usuario.
2. **Jerarquía de 3 Niveles en el Feed:**
   - **Nivel 1 — Destacada:** 1 nota principal por franja horaria con imagen grande y título a `20–24px`.
   - **Nivel 2 — Local TDF:** Tarjetas compactas (`título + fuente(s) agrupadas + hora tabular`, sin hashtags visibles) agrupadas por ciudad (`Ushuaia`, `Río Grande`, `Tolhuin`).
   - **Nivel 3 — Cables Nacionales / Internacionales:** Lista compacta de solo texto colapsada bajo el encabezado `"Otras noticias"`.
3. **Tarjetas de Alerta Semánticas:**
   - Fondo tintado (`--color-alert-critical`, `--color-alert-warning`, `--color-alert-info`), ícono lineal de advertencia, título corto en mayúscula de sentencia, organismo emisor (`Defensa Civil`, `Vialidad Nacional`, `Vialidad Provincial`), hora de última sincronización y TTL de caducidad automática, **sin botones de compartir**.
4. **Módulo Único de Redes Sociales:**
   - Pestañas por cuenta oficial con autoplay desactivado por defecto y activable por el usuario.
5. **Filtro Persistente por Ciudad y Categoría:**
   - Chips compactos visibles sin scroll que recuerdan la última selección del usuario en `localStorage`.
