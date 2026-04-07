# Be Candid — Play Store Feature Graphic Spec

> The feature graphic is the hero banner displayed at the top of the Play Store
> listing. It appears on the app's detail page and in featured placements.

---

## Dimensions

**1024 x 500 px** (required by Google Play)

Export as PNG, sRGB color profile. No transparency.

---

## Layout

The graphic is divided into two visual zones along a roughly 55/45 split:

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   BE CANDID                          ┌─────────────┐    │
│   ─────────                          │             │    │
│   Align Your Digital Life            │  Dashboard  │    │
│                                      │   Mockup    │    │
│   "Accountability. Not               │  (Pixel 8)  │    │
│    surveillance."                    │             │    │
│                                      └─────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
     LEFT ZONE (55%)                   RIGHT ZONE (45%)
```

---

## Left Zone — Brand & Message

### Logo

- Full Be Candid logo (icon + wordmark) placed in the upper-left quadrant.
- Logo should be white or off-white (#F5F5F5) on the gradient background.
- Minimum clear space: 40px on all sides of the logo.
- Logo height: approximately 48-56px at export scale.

### Primary Tagline

- **Text:** "Align Your Digital Life"
- **Font:** App headline font, bold weight.
- **Size:** 48-56px at 1024x500 export resolution.
- **Color:** White (#FFFFFF).
- **Position:** Centered vertically in the left zone, below the logo with
  24-32px spacing.

### Secondary Tagline

- **Text:** "Accountability. Not surveillance."
- **Font:** App body font, regular or medium weight.
- **Size:** 24-28px at export resolution.
- **Color:** White at 80% opacity (#FFFFFFCC).
- **Position:** Below the primary tagline with 12-16px spacing.

### No Additional Text

Do not add feature lists, pricing, download counts, or award badges.
The feature graphic must be clean and scannable at thumbnail size.

---

## Right Zone — Device Mockup

### Device

- **Frame:** Google Pixel 8, straight-on or angled 5-8 degrees to the left
  for subtle depth.
- **Screen content:** Dashboard home screen showing the DashboardHero component
  with:
  - Momentum score ring (show score of 76)
  - Active streak counter (14 days)
  - Mood sparkline trending upward
- **Shadow:** Subtle drop shadow beneath the device to lift it off the gradient.
  Shadow color: `rgba(0, 0, 0, 0.25)`, blur 32px, offset-y 8px.

### Positioning

- The device should be vertically centered in the right zone.
- The device can extend slightly beyond the bottom edge of the graphic (cropped
  at the bottom) to create depth. Do not crop the top of the device.
- The device must not overlap the primary tagline text.

---

## Background

### Gradient

Teal-to-dark-slate diagonal gradient, consistent with the app's brand palette:

```
linear-gradient(135deg, #0D9488 0%, #1E293B 100%)
```

### Optional Texture

A very subtle noise texture (2-4% opacity) may be overlaid on the gradient to
add depth and prevent banding on lower-quality displays. Do not use it if it
introduces visible artifacts at the 1024x500 resolution.

### No Decorative Elements

Do not add abstract blobs, geometric patterns, sparkles, or floating UI
fragments. The graphic should feel premium and restrained.

---

## Safe Zones

Google may crop or overlay elements on the feature graphic depending on
context. Keep all critical content within a safe zone:

```
┌──────────────────────────────────────────────────────────┐
│  48px                                              48px  │
│  ┌──────────────────────────────────────────────────┐    │
│  │                                                  │    │
│  │           SAFE ZONE (928 x 404)                  │    │
│  │                                                  │    │
│  └──────────────────────────────────────────────────┘    │
│  48px                                              48px  │
└──────────────────────────────────────────────────────────┘
```

- **Top/Bottom padding:** 48px
- **Left/Right padding:** 48px
- All text and the device screen content must be within the safe zone.
- The device frame and shadow may extend into the padding area.

---

## Thumbnail Readability Test

The feature graphic often appears as a small thumbnail (around 180x88 px
equivalent). Before finalizing:

1. Scale the graphic to 180x88 px.
2. Confirm the logo is still recognizable.
3. Confirm "Align Your Digital Life" is still legible (or at least the "Be
   Candid" brand reads clearly).
4. Confirm the phone mockup reads as a phone and not an ambiguous shape.

If any element fails at thumbnail scale, increase its size or simplify.

---

## Color Reference

| Element | Color | Hex |
|---------|-------|-----|
| Gradient start (teal) | Teal-600 | #0D9488 |
| Gradient end (dark slate) | Slate-800 | #1E293B |
| Logo / headline text | White | #FFFFFF |
| Subtitle text | White 80% | #FFFFFFCC |
| Device shadow | Black 25% | rgba(0,0,0,0.25) |
| Momentum ring accent | Teal-400 | #2DD4BF |

---

## Delivery Checklist

- [ ] 1024x500 PNG, sRGB, no transparency
- [ ] Passes thumbnail readability test at 180x88
- [ ] Source file (Figma frame link or PSD)
- [ ] Logo vector included separately for future reuse
- [ ] Verified against Google Play feature graphic guidelines (2024)
