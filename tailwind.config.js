const { designSystem: ds } = require('./designSystem.json');

const { colors, typography, spacing, layout, radius, iconSizes, shadows, components } = ds;

/** `#RRGGBB` to the `R G B` channel triplet a CSS custom property needs. */
function toChannels(hex) {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ].join(' ');
}

/** `#RRGGBB` plus an alpha channel, since a CSS box-shadow needs the opacity inline. */
function hexToRgba(hex, alpha) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Scheme-aware tokens, paired light and dark.
 *
 * These are emitted as CSS custom properties rather than fixed colours, so a component
 * writes `bg-bg-main` once and the value follows the active scheme. The alternative,
 * repeating `dark:bg-bg-main` at every call site, encodes the scheme in every component
 * and is the drift this arrangement exists to prevent.
 */
const schemeAware = {
  'bg-main': [colors.bg.main.light, colors.bg.main.dark],
  'bg-surface': [colors.bg.surface.light, colors.bg.surface.dark],
  'surface-card': [colors.surface.card.light, colors.surface.card.dark],
  'surface-card-elevated': [colors.surface.cardElevated.light, colors.surface.cardElevated.dark],
  'surface-input': [colors.surface.input.light, colors.surface.input.dark],
  'text-primary': [colors.text.primary.light, colors.text.primary.dark],
  'text-secondary': [colors.text.secondary.light, colors.text.secondary.dark],
  'text-muted': [colors.text.muted.light, colors.text.muted.dark],
  border: [colors.border.light, colors.border.dark],
};

const schemeTokens = Object.fromEntries(
  Object.keys(schemeAware).map((name) => [name, `rgb(var(--${name}) / <alpha-value>)`]),
);

/**
 * The scheme-aware declarations, written to `global.css` by `scripts/write-theme-css.mjs`.
 * Generating that file from this table keeps the two from drifting apart.
 *
 * The dark selector must be `.dark:root`, not a bare `.dark`. NativeWind recognises dark root
 * variables only in the forms `.dark:root`, `:root.dark` or `:root[class~="dark"]`; any other
 * `.dark` rule is compiled as an ordinary utility class that no component carries, so the dark
 * values would never apply.
 */
const cssVariables = [':root', '.dark:root']
  .map((selector, index) => {
    const block = Object.entries(schemeAware)
      .map(([name, [light, dark]]) => `  --${name}: ${toChannels(index === 0 ? light : dark)};`)
      .join('\n');
    return `${selector} {\n${block}\n}`;
  })
  .join('\n\n');

/** Scheme-independent tokens: brand, status and overlay. */
const shared = {
  // Flattened deliberately. A nested `primary: { base, pressed }` would only expose
  // `bg-primary-base`, forcing every call site to name the variant.
  primary: colors.primary.base,
  'primary-pressed': colors.primary.pressed,
  'text-on-primary': colors.text.onPrimary,
  'text-on-secondary': colors.text.onSecondary,
  'status-good': colors.status.good,
  'status-warning': colors.status.warning,
  'status-bad': colors.status.bad,
  'status-good-soft': colors.status.goodSoft,
  'status-warning-soft': colors.status.warningSoft,
  'status-bad-soft': colors.status.badSoft,
  scrim: colors.overlay.scrim,
  'on-map': colors.overlay.primaryOnMap,
};

/** Re-keys an object of token maps, e.g. `{ space16: 16 }` to `{ 'space-16': '16' }`. */
const rekey = (source, rename = (name) => name) =>
  Object.fromEntries(Object.entries(source).map(([name, value]) => [rename(name), String(value)]));

/**
 * Each named text style becomes a `text-<name>` size carrying its own line height.
 *
 * The unit is appended rather than left off: Tailwind passes the value through verbatim, and
 * a bare `font-size: 14` is invalid CSS, so the web build would silently fall back to the
 * browser default. NativeWind normalises `px` to density-independent units for React Native,
 * so one token serves both targets.
 */
const fontSize = Object.fromEntries(
  Object.entries(typography.styles).map(([name, style]) => [
    name,
    [`${style.fontSize}px`, { lineHeight: `${style.lineHeight}px` }],
  ]),
);

/**
 * Heights and widths that `designSystem.json` assigns to a specific component. Exposed
 * as named tokens so a component reads `h-control` instead of an arbitrary number.
 */
const componentSize = {
  control: components.button.height,
  'control-sm': components.button.heightSmall,
  'chip-control': components.filterChip.height,
  search: components.searchBar.height,
  input: components.input.height,
  'bottom-nav': components.bottomNav.height,
  'spot-image': components.spotCard.imageHeight,
  'equipment-tile': components.equipmentCard.width,
  'review-avatar': components.reviewCard.avatar.size,
};

/** Icon dimensions, exposed as `w-icon-<name>` / `h-icon-<name>`. */
const iconSize = rekey(iconSizes, (name) => `icon-${name}`);

/**
 * Renders a shadow as a CSS `box-shadow` string.
 *
 * Tailwind's `shadow` plugin parses these values as strings, so passing a React Native
 * style object makes it throw `input.slice is not a function`. That error is raised inside
 * Metro's worker and stalls the bundler without printing anything, so these must be
 * strings. The Android elevation travels separately, below.
 */
const toBoxShadow = ({ ios }) =>
  `${ios.offsetX}px ${ios.offsetY}px ${ios.radius}px 0 ${hexToRgba(ios.color, ios.opacity)}`;

/** @type {import('tailwindcss').Config} */
const config = {
  // 'class' so the scheme is applied through NativeWind's useColorScheme hook, which keeps
  // it observable and overridable rather than reading the OS setting implicitly.
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    // Replaces Tailwind's default weight scale rather than extending it. Each loaded family
    // already encodes its weight (`Inter_700Bold`), and emitting a `font-weight` alongside a
    // custom `font-family` makes Android fail to resolve the family and fall back to the system
    // font. It would also give `font-bold` two meanings, since the family scale below claims the
    // same names. An empty scale leaves `font-bold` to mean `Inter_700Bold` and nothing else.
    fontWeight: {},
    extend: {
      colors: { ...schemeTokens, ...shared },
      fontSize,
      fontFamily: rekey(typography.fontFamilies),
      spacing: {
        ...rekey(spacing, (name) => name.replace('space', 'space-')),
        'screen-px': layout.screenHorizontalPadding,
        'section-gap': layout.sectionGap,
        'section-gap-lg': layout.sectionGapLarge,
        'card-pad': layout.cardPadding,
        'card-gap': layout.cardGap,
        'card-gap-lg': layout.cardGapLarge,
        'list-gap': layout.listGap,
      },
      borderRadius: rekey(radius),
      height: { ...componentSize, ...iconSize },
      width: { ...componentSize, ...iconSize },
      minHeight: componentSize,
      boxShadow: {
        card: toBoxShadow(shadows.card),
        'card-elevated': toBoxShadow(shadows.cardElevated),
        button: toBoxShadow(shadows.button),
      },
      // No `elevation` scale. Tailwind has no elevation utility, and NativeWind's preset
      // adds none, so an `elevation-*` class would compile to nothing. NativeWind derives
      // Android elevation from the box-shadow value above.
    },
  },
  plugins: [],
};

module.exports = config;
module.exports.cssVariables = cssVariables;
