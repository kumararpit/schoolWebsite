---
name: Grounded Heritage
colors:
  surface: '#fcf9f2'
  surface-dim: '#dcdad3'
  surface-bright: '#fcf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ec'
  surface-container: '#f0eee7'
  surface-container-high: '#ebe8e1'
  surface-container-highest: '#e5e2db'
  on-surface: '#1c1c18'
  on-surface-variant: '#56423e'
  inverse-surface: '#31312c'
  inverse-on-surface: '#f3f0ea'
  outline: '#89726d'
  outline-variant: '#dcc0bb'
  surface-tint: '#9d422f'
  primary: '#943b29'
  on-primary: '#ffffff'
  primary-container: '#b3523e'
  on-primary-container: '#fff1ee'
  inverse-primary: '#ffb4a4'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#fdc65c'
  on-secondary-container: '#745200'
  tertiary: '#4a5b45'
  on-tertiary: '#ffffff'
  tertiary-container: '#62745c'
  on-tertiary-container: '#e5fadc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a4'
  on-primary-fixed: '#3e0500'
  on-primary-fixed-variant: '#7e2b1a'
  secondary-fixed: '#ffdea7'
  secondary-fixed-dim: '#f4be55'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#d4e8cb'
  tertiary-fixed-dim: '#b8ccb0'
  on-tertiary-fixed: '#0f1f0d'
  on-tertiary-fixed-variant: '#3a4b36'
  background: '#fcf9f2'
  on-background: '#1c1c18'
  surface-variant: '#e5e2db'
typography:
  headline-xl:
    fontFamily: Literata
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Literata
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Literata
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Open Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Open Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Open Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Open Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1120px
  gutter: 24px
---

## Brand & Style
This design system centers on a "Grounded Heritage" aesthetic, specifically tailored for an educational environment that values tradition, community, and the tactile nature of Montessori learning. The visual language avoids the coldness of modern tech by embracing warmth through organic tones and a "high-touch" feel. 

The target audience consists of parents and educators seeking a balance of structured reliability and nurturing warmth. The style is a blend of **Minimalism** and **Modern-Traditionalism**, utilizing generous whitespace to provide clarity while employing subtle textures and classic motifs to evoke a sense of history and local roots. It should feel like a well-kept library or a sunlit classroom—organized, quiet, and full of potential.

## Colors
The palette is inspired by natural materials and traditional school elements. 

- **Primary (Earthy Terracotta):** Used for key branding elements, primary buttons, and active states. It represents the clay of the earth and a grounded foundation.
- **Secondary (Soft School-bus Yellow):** A muted, warm yellow used for highlights, alerts, or celebratory accents. It evokes optimism without being overstimulating.
- **Tertiary (Sage Leaf):** A calming green used for environmental or growth-related callouts, reinforcing the connection to the Montessori "living" classroom.
- **Neutral (Cream):** The primary background color. It is softer on the eyes than pure white and provides a "paper-like" warmth.
- **Text (Deep Charcoal):** A high-contrast but slightly softened black for maximum readability and a classic "printed" feel.

## Typography
The typographic hierarchy prioritizes readability and an authoritative yet gentle voice. 

**Literata** is used for all headings. Its bookish, scholarly character provides the "traditional" anchor for the design system. It should be typeset with slightly tighter tracking in larger sizes to maintain a cohesive look.

**Open Sans** serves as the functional workhorse for body copy and UI elements. Its humanist shapes keep the interface feeling friendly and accessible. 

Use sentence case for headings to remain approachable. Reserve all-caps only for small labels or breadcrumbs to maintain a structured, organized feel.

## Layout & Spacing
The design system employs a **Fixed Grid** model on desktop to ensure a curated, editorial feel that doesn't feel overly "app-like." 

- **Desktop:** 12-column grid within a 1120px container. Content is centered to provide wide, calming margins on large screens.
- **Tablet:** 8-column grid with 32px side margins.
- **Mobile:** 4-column grid with 20px side margins.

Spacing follows an 8px rhythmic scale. Generous use of `lg` (48px) and `xl` (80px) vertical spacing is encouraged between major sections to prevent the UI from feeling cluttered, reflecting the Montessori principle of "order and space."

## Elevation & Depth
To maintain a traditional and grounded feel, the design system avoids heavy shadows or complex blurs. Instead, it uses **Low-contrast outlines** and **Tonal layers**.

- **Surfaces:** Use subtle shifts in background color (e.g., a slightly darker cream or a very pale terracotta wash) to denote different functional areas.
- **Outlines:** Use thin (1px) borders in a darkened version of the background color or a light charcoal for structure.
- **Shadows:** When necessary (e.g., for modal dialogs or primary cards), use a "Sun-baked Shadow"—a very soft, diffused drop shadow with a slight warm tint (#2D2926 at 5-8% opacity) to suggest the element is resting gently on the page rather than floating high above it.

## Shapes
Shapes are intentionally conservative. A "Soft" (0.25rem) corner radius is applied to standard components like buttons and input fields. This provides a touch of friendliness while retaining the structured, rectangular feel of traditional educational materials (like flashcards or wooden blocks).

Large containers, such as cards or image frames, may use `rounded-lg` (0.5rem) to further soften the layout without veering into a "bubbly" or overly modern aesthetic.

## Components
Consistent component styling reinforces the school's identity as organized and resourceful.

- **Buttons:** Primary buttons use the Terracotta background with White text. Secondary buttons use a Cream background with a Terracotta border and text. All buttons have a 1px border and a subtle transition to a slightly deeper shade on hover.
- **Input Fields:** Use a simple 1px border in a muted charcoal. Focus states should use a 2px Terracotta bottom-border only, mimicking a line on a notepad.
- **Cards:** Cards should be flat with a 1px border in a warm neutral. Do not use heavy shadows. Use a "header" area within the card with a soft Yellow or Sage background to categorize information.
- **Chips/Tags:** Use the Sage Leaf color for educational categories or the Secondary Yellow for status indicators. Chips should have a 0.25rem radius.
- **Lists:** Use custom bullet points (small solid circles in Terracotta) and ensure generous line-height for readability.
- **Lists/Navigation:** Use a "traditional" horizontal nav with Literata for top-level links, emphasizing the school's name as the central anchor.