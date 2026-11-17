# Apple-Inspired UI/UX Design System

## Guía y prompt maestro para desarrollar un frontend web

Este documento define los criterios visuales, de experiencia de usuario
y de implementación que deben seguirse al desarrollar el frontend de la
aplicación. La referencia principal es **Apple Human Interface
Guidelines (HIG)**, adaptada a una aplicación web moderna.

> **Objetivo:** conseguir una interfaz profesional, clara, consistente,
> intuitiva y cuidadosamente diseñada, inspirada en la experiencia de
> las aplicaciones de Apple. No se busca copiar literalmente una
> aplicación de Apple, sino aplicar sus principios de diseño al contexto
> y necesidades del producto.

Referencia oficial: [Apple Human Interface
Guidelines](https://developer.apple.com/design/human-interface-guidelines/).

------------------------------------------------------------------------

# 1. Prompt maestro

Copia el siguiente prompt y utilízalo con el agente de desarrollo que
trabajará sobre el repositorio.

## Role: Senior UI/UX Designer & Senior Frontend Engineer

Act as a Senior Product Designer specialized in Apple's Human Interface
Guidelines (HIG), combined with a Senior Frontend Engineer.

Your task is to design and implement a production-quality frontend using
an Apple-inspired design language.

### 1.1 Design Philosophy

Use Apple's Human Interface Guidelines as the primary design reference.

The interface must follow these principles:

-   **Simplicity:** remove unnecessary visual elements and complexity.
-   **Clarity:** every component must have a clear purpose.
-   **Consistency:** maintain consistent spacing, typography, colors,
    and interactions.
-   **Hierarchy:** use typography, spacing, contrast, and positioning to
    establish visual hierarchy.
-   **Deference:** the interface should prioritize content over
    decoration.
-   **Feedback:** every interaction must provide clear visual feedback.
-   **Familiarity:** use recognizable interaction patterns and intuitive
    navigation.

The result should feel like a carefully designed native Apple
application, adapted to the web, not like a generic SaaS dashboard.

### 1.2 Visual Design System

#### Typography

-   Use SF Pro Display and SF Pro Text when legally and technically
    available.
-   Otherwise, use an appropriate system font stack, such as
    `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, and sans-serif.
-   Establish a consistent typographic scale.
-   Use font weight and size to create hierarchy.
-   Avoid excessive bold text.
-   Ensure comfortable line height and readable text sizes.

#### Colors

-   Use a restrained and sophisticated color palette.
-   Prefer neutral backgrounds such as white, off-white, and light gray.
-   Use subtle borders and separators.
-   Use Apple's system colors as inspiration, not as a requirement to
    copy exact values.
-   Use one primary accent color and semantic colors for success,
    warning, danger, and information.
-   Support light and dark themes.
-   Verify contrast in both themes.

#### Layout

-   Use generous but purposeful whitespace.
-   Apply consistent spacing throughout the application.
-   Prefer clean layouts with clear content hierarchy.
-   Avoid unnecessary containers, borders, and shadows.
-   Use rounded corners consistently and with restraint.
-   Maintain responsive layouts.
-   Let the content determine the layout; do not force every screen into
    the same template.

#### Components

Implement reusable components following the design system:

-   Buttons
-   Inputs and text areas
-   Search fields
-   Dropdowns and selects
-   Navigation bars
-   Sidebars
-   Cards
-   Tables and data lists
-   Modals and dialogs
-   Popovers
-   Tooltips
-   Tabs
-   Toast notifications
-   Empty states
-   Loading states and skeleton loaders
-   Pagination
-   Breadcrumbs
-   Badges and status indicators
-   Form validation messages

Components must have consistent visual behavior and interaction states.

### 1.3 Interaction Design

Follow Apple's interaction principles:

-   Smooth and subtle transitions.
-   Meaningful hover, focus, active, selected, and disabled states.
-   Clear feedback after user actions.
-   Native-feeling dialogs and popovers.
-   Predictable navigation.
-   Keyboard accessibility.
-   Appropriate micro-interactions.
-   Clear loading, success, and error feedback.

Animations should be subtle, purposeful, and performant.

Avoid excessive animations, bouncing effects, gradients, and unnecessary
motion. Respect the user's reduced-motion preference.

### 1.4 Layout and Navigation

Choose navigation patterns according to the application's information
architecture and device:

-   Sidebar navigation for desktop productivity and administration
    applications when it improves discoverability.
-   Tab navigation for mobile applications with a small number of
    primary destinations.
-   Navigation bars for contextual navigation.
-   Sheets and dialogs for secondary tasks.
-   Breadcrumbs for deep hierarchies where users need orientation.

Do not force an Apple navigation pattern if it does not fit the
application's workflows.

### 1.5 Responsive Design

The application must work correctly on:

-   Desktop
-   Laptop
-   Tablet
-   Mobile

Do not simply scale down the desktop interface. Adapt the layout,
information density, controls, and navigation to each screen size.

Ensure that tables, forms, navigation, dialogs, and complex workflows
remain usable on smaller screens.

### 1.6 Accessibility

Follow WCAG 2.2 AA principles where applicable:

-   Accessible color contrast.
-   Keyboard navigation.
-   Semantic HTML.
-   Visible focus indicators.
-   Accessible form labels.
-   Screen reader support.
-   Appropriate ARIA attributes only when needed.
-   Sufficient touch target sizes.
-   Reduced motion support.
-   Errors communicated in text, not only through color.

### 1.7 Technical Implementation

Before implementing:

1.  Inspect the existing project structure.
2.  Identify the framework, dependencies, and architectural conventions.
3.  Review existing components and styles.
4.  Identify reusable components and existing design decisions.
5.  Understand the screens, user roles, and primary workflows.
6.  Propose the design system structure.

Implementation requirements:

-   Reuse existing technologies and conventions.
-   Build reusable and maintainable components.
-   Centralize design tokens.
-   Avoid duplicated styles.
-   Keep business logic separate from presentation.
-   Do not introduce unnecessary dependencies.
-   Preserve existing functionality.
-   Do not replace working application behavior with mock interactions.
-   Use realistic content and data structures appropriate to the
    product.
-   Handle loading, empty, success, validation, and error states.

### 1.8 Design Tokens

Create centralized tokens for:

-   Colors
-   Typography
-   Spacing
-   Border radius
-   Shadows
-   Borders
-   Transitions
-   Z-index
-   Breakpoints
-   Component dimensions where appropriate

All components must consume these tokens instead of defining arbitrary
values.

Prefer CSS variables or the project's existing token mechanism. Define
tokens for both light and dark themes.

### 1.9 Quality Requirements

The final result must:

-   Look professionally designed.
-   Have consistent visual hierarchy.
-   Avoid generic AI-generated dashboard aesthetics.
-   Avoid excessive cards and containers.
-   Avoid unnecessary gradients.
-   Avoid inconsistent spacing.
-   Have no broken layouts.
-   Include all relevant interaction states.
-   Be fully responsive.
-   Be accessible and keyboard-operable.
-   Preserve the application's functional requirements.

### 1.10 Implementation Workflow

Work in the following order:

1.  Analyze the application and its requirements.
2.  Review the existing architecture and conventions.
3.  Define the visual direction.
4.  Define the design tokens.
5.  Establish the component architecture.
6.  Implement the global layout and navigation.
7.  Implement individual screens.
8.  Implement interactions and states.
9.  Validate responsive behavior.
10. Review visual consistency and accessibility.
11. Refine the interface.

Do not start coding before understanding the existing application.
Present the proposed design-system structure and key decisions before
making broad changes.

Prioritize design quality, usability, consistency, accessibility, and
maintainability over implementation speed.

------------------------------------------------------------------------

# 2. Referencias visuales

Apple tiene diferentes estilos visuales. No todas sus aplicaciones
utilizan exactamente los mismos patrones. Utiliza estas referencias
según la necesidad de cada pantalla:

  -----------------------------------------------------------------------
Referencia                          Qué observar
  ----------------------------------- -----------------------------------
**macOS Settings**                  Configuraciones, formularios,
navegación lateral y jerarquía.

**iCloud Web**                      Aplicaciones web, espacios limpios
y organización del contenido.

**macOS Finder**                    Tablas, listas, navegación y
gestión de información.

**Apple Human Interface Guidelines  Uso de materiales, capas,
-- Materials**                      translucidez y profundidad visual.
  -----------------------------------------------------------------------

No copies una pantalla de referencia de forma literal. Identifica los
patrones que resuelven problemas similares a los de la aplicación.

## 2.1 Liquid Glass

Liquid Glass puede servir como referencia para superficies contextuales,
controles flotantes o capas de navegación cuando sea apropiado. No debe
aplicarse a toda la interfaz.

-   Evitar glassmorphism en todos los paneles.
-   No sacrificar contraste ni legibilidad.
-   Usar translucidez solo cuando ayude a comunicar capas o contexto.
-   Mantener el contenido principal sobre superficies claras y legibles.

------------------------------------------------------------------------

# 3. Tecnologías sugeridas

Estas tecnologías son opciones, no requisitos absolutos. Antes de añadir
dependencias, inspecciona el proyecto y reutiliza lo que ya exista.

Tecnología        Uso
  ----------------- ------------------------------------------------------
React / Next.js   Framework de frontend.
Tailwind CSS      Utilidades de estilos y responsive design.
Radix UI          Primitivos accesibles para componentes interactivos.
Lucide Icons      Iconografía consistente.
Framer Motion     Animaciones y transiciones, cuando aporten valor.
CSS Variables     Centralización de design tokens y temas.

Una estrategia posible es utilizar Radix UI para los comportamientos
accesibles y construir una capa visual propia encima, siguiendo el
sistema de diseño definido.

No instales todas estas herramientas por defecto. Elige únicamente las
que resuelvan una necesidad real y sean compatibles con la arquitectura
existente.

------------------------------------------------------------------------

# 4. Anti-patterns: elementos que se deben evitar

No generes interfaces SaaS genéricas ni diseños que parezcan producidos
automáticamente sin criterio de producto.

Evita:

-   Exceso de tarjetas con esquinas redondeadas.
-   Gradientes usados únicamente como decoración.
-   Glassmorphism en todas las superficies.
-   Sombras excesivas.
-   Demasiados contenedores anidados.
-   Encabezados desproporcionadamente grandes.
-   Iconos innecesarios.
-   Colores de acento aleatorios.
-   Espaciados inconsistentes.
-   Dashboards compuestos exclusivamente por tarjetas.
-   Elementos decorativos sin propósito funcional.
-   Animaciones que distraigan o ralenticen el uso.
-   Controles que parezcan interactivos pero no funcionen.

Prefiere:

-   Superficies limpias y simples.
-   Separadores sutiles.
-   Tipografía clara.
-   Espacios en blanco intencionales.
-   Uso moderado del color.
-   Controles con apariencia nativa y comportamiento predecible.
-   Jerarquía de información sólida.
-   Minimalismo funcional.
-   Densidad de información adecuada al tipo de tarea.

La interfaz debe parecer diseñada intencionalmente por un equipo
experimentado de diseño de producto.

------------------------------------------------------------------------

# 5. Proceso recomendado de trabajo

No solicites la implementación completa en un único paso. Divide el
trabajo en dos fases para mantener consistencia.

## Fase 1 --- Definición del Design System

Solicita al agente que analice el producto y proponga:

1.  Dirección visual y referencias aplicables.
2.  Paleta de colores y colores semánticos.
3.  Tipografía y escala tipográfica.
4.  Sistema de espaciado.
5.  Bordes, radios y elevaciones.
6.  Tokens para light mode y dark mode.
7.  Componentes reutilizables y sus variantes.
8.  Estados de interacción.
9.  Patrones de navegación.
10. Reglas responsive y de accesibilidad.
11. Organización de carpetas y archivos del sistema de diseño.

**Criterio de aprobación:** el sistema debe ser coherente, cubrir las
necesidades reales del producto y poder reutilizarse en todas las
pantallas.

## Fase 2 --- Implementación del frontend

Una vez aprobado el Design System:

1.  Implementar los tokens globales.
2.  Implementar los componentes base.
3.  Implementar navegación y layout.
4.  Implementar las pantallas y flujos funcionales.
5.  Conectar los componentes con la lógica y los datos existentes.
6.  Añadir estados de carga, vacío, error y éxito.
7.  Adaptar cada pantalla a desktop, tablet y mobile.
8.  Verificar accesibilidad y navegación por teclado.
9.  Revisar consistencia visual entre pantallas.
10. Corregir defectos visuales y funcionales.

**Regla:** las pantallas deben reutilizar los tokens y componentes
aprobados. No crear estilos aislados o arbitrarios para cada pantalla.

------------------------------------------------------------------------

# 6. Prompt para iniciar la Fase 1

Utiliza este prompt después de proporcionar el documento al agente:

> Analiza el repositorio y los requerimientos del producto. Utiliza este
> documento como guía obligatoria para definir un Design System
> inspirado en Apple Human Interface Guidelines.
>
> En esta primera etapa no implementes todas las pantallas. Inspecciona
> la arquitectura existente, identifica los patrones y componentes
> reutilizables y presenta una propuesta concreta que incluya tokens,
> tipografía, paleta de colores, navegación, componentes, estados,
> responsive y accesibilidad.
>
> Justifica las decisiones de diseño según las necesidades del producto.
> Evita imponer patrones de Apple que no sean adecuados para los flujos
> reales de la aplicación.
>
> Espera la aprobación de la propuesta antes de realizar cambios
> extensos en el frontend.

# 7. Prompt para iniciar la Fase 2

Una vez aprobado el sistema de diseño:

> Implementa el frontend siguiendo estrictamente el Design System
> aprobado y las reglas de este documento.
>
> Antes de modificar cada pantalla, revisa sus requerimientos y flujos.
> Reutiliza los componentes y tokens existentes. No introduzcas nuevos
> estilos visuales sin una razón justificada.
>
> Implementa estados de interacción completos, responsive design,
> accesibilidad y feedback para las acciones del usuario. Conserva la
> lógica de negocio y las funcionalidades existentes.
>
> Al finalizar, revisa todas las pantallas para detectar
> inconsistencias, errores de responsive, componentes duplicados,
> estados faltantes y problemas de accesibilidad. Corrige los problemas
> encontrados y entrega un resumen de los archivos modificados y las
> decisiones relevantes.

------------------------------------------------------------------------

# 8. Checklist de aceptación

Antes de considerar terminado el frontend, verifica:

## Diseño visual

-   [ ] Existe una jerarquía tipográfica consistente.
-   [ ] La paleta de colores está centralizada.
-   [ ] Los espaciados siguen una escala definida.
-   [ ] Los bordes, radios y sombras son consistentes.
-   [ ] No hay tarjetas o contenedores innecesarios.
-   [ ] Los iconos tienen un estilo consistente.
-   [ ] Light mode y dark mode mantienen legibilidad.

## Componentes e interacción

-   [ ] Los botones tienen estados normal, hover, focus, active y
    disabled.
-   [ ] Los formularios muestran validaciones claras.
-   [ ] Los diálogos y popovers se comportan correctamente.
-   [ ] Las acciones muestran feedback.
-   [ ] Existen estados de carga, vacío, error y éxito.
-   [ ] Los controles funcionan con teclado.

## Responsive

-   [ ] La interfaz funciona en desktop.
-   [ ] La interfaz funciona en laptop.
-   [ ] La interfaz funciona en tablet.
-   [ ] La interfaz funciona en mobile.
-   [ ] Las tablas y formularios siguen siendo utilizables en pantallas
    pequeñas.
-   [ ] La navegación se adapta al tamaño de pantalla.

## Calidad técnica

-   [ ] Los componentes son reutilizables.
-   [ ] Los tokens están centralizados.
-   [ ] No hay estilos duplicados innecesarios.
-   [ ] No se rompió la funcionalidad existente.
-   [ ] No se añadieron dependencias innecesarias.
-   [ ] No hay errores de consola relevantes.
-   [ ] Se verificaron accesibilidad y contraste.

------------------------------------------------------------------------

# 9. Principio final

**Apple-inspired no significa simplemente usar blanco, bordes
redondeados y sombras suaves.**

Significa diseñar una experiencia donde cada elemento tiene una razón de
existir, la información se entiende rápidamente, las interacciones son
predecibles y la interfaz mantiene una consistencia visual y funcional
en todo el producto.

El resultado debe ser una aplicación reconocible por su claridad,
simplicidad, precisión y calidad de ejecución, adaptada a las
necesidades reales de sus usuarios.
