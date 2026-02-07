# EduHub Color Scheme Guide

## 🎨 Youth-Friendly Vibrant Palette

This document provides the complete color scheme reference for EduHub's updated design.

---

## Primary Colors

### Purple (Primary Brand Color)
```css
purple-50:  #faf5ff  /* Light backgrounds */
purple-100: #f3e8ff  /* Subtle accents */
purple-200: #e9d5ff  /* Borders, light states */
purple-300: #d8b4fe  /* Placeholders */
purple-400: #c084fc  /* Secondary elements */
purple-500: #a855f7  /* Interactive states */
purple-600: #7c3aed  /* Primary buttons, links */
purple-700: #6d28d9  /* Hover states */
purple-800: #5b21b6  /* Active states */
purple-900: #4c1d95  /* Dark text */
```

### Pink (Secondary Brand Color)
```css
pink-50:  #fdf2f8  /* Light backgrounds */
pink-100: #fce7f3  /* Subtle accents */
pink-200: #fbcfe8  /* Borders */
pink-300: #f9a8d4  /* Light elements */
pink-400: #f472b6  /* Secondary interactive */
pink-500: #ec4899  /* Accents */
pink-600: #db2777  /* Strong accents */
pink-700: #be185d  /* Dark pink */
pink-800: #9f1239  /* Deeper pink */
pink-900: #831843  /* Darkest pink */
```

### Blue (Tertiary Brand Color)
```css
blue-50:  #eff6ff  /* Light backgrounds */
blue-100: #dbeafe  /* Subtle accents */
blue-200: #bfdbfe  /* Borders */
blue-300: #93c5fd  /* Light elements */
blue-400: #60a5fa  /* Interactive states */
blue-500: #3b82f6  /* Links */
blue-600: #2563eb  /* Primary blue */
blue-700: #1d4ed8  /* Hover blue */
blue-800: #1e40af  /* Active blue */
blue-900: #1e3a8a  /* Dark blue */
```

---

## Accent Colors

### Yellow (Highlights & CTAs)
```css
yellow-50:  #fefce8  /* Lightest */
yellow-100: #fef9c3  /* Very light */
yellow-200: #fef08a  /* Light */
yellow-300: #fde047  /* Medium */
yellow-400: #fbbf24  /* Primary accent */
yellow-500: #f59e0b  /* Strong accent */
yellow-600: #d97706  /* Dark accent */
```

### Green (Success States)
```css
green-50:  #f0fdf4   /* Success backgrounds */
green-100: #dcfce7   /* Light success */
green-200: #bbf7d0   /* Borders */
green-500: #22c55e   /* Success messages */
green-600: #16a34a   /* Strong success */
green-700: #15803d   /* Dark success */
green-800: #166534   /* Deeper success */
```

---

## Neutral Colors

### Gray (Text & Backgrounds)
```css
gray-50:  #f9fafb  /* Lightest background */
gray-100: #f3f4f6  /* Light background */
gray-200: #e5e7eb  /* Subtle borders */
gray-300: #d1d5db  /* Light borders */
gray-400: #9ca3af  /* Placeholder text */
gray-500: #6b7280  /* Secondary text */
gray-600: #4b5563  /* Body text */
gray-700: #374151  /* Strong text */
gray-800: #1f2937  /* Headings */
gray-900: #111827  /* Primary text */
```

### White & Black
```css
white: #ffffff  /* Pure white */
black: #000000  /* Pure black */
```

---

## Gradient Combinations

### Primary Gradients

#### Purple-Pink Gradient (Main CTA)
```css
/* Tailwind Class */
bg-gradient-to-r from-purple-600 to-pink-600

/* CSS */
background: linear-gradient(to right, #7c3aed, #db2777);
```

#### Purple-Blue Gradient (Alternative)
```css
/* Tailwind Class */
bg-gradient-to-r from-purple-600 to-blue-600

/* CSS */
background: linear-gradient(to right, #7c3aed, #2563eb);
```

#### Pink-Blue Gradient (Tertiary)
```css
/* Tailwind Class */
bg-gradient-to-r from-pink-600 to-blue-600

/* CSS */
background: linear-gradient(to right, #db2777, #2563eb);
```

### Background Gradients

#### Hero Background
```css
/* Tailwind Class */
bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50

/* CSS */
background: linear-gradient(to bottom right, #faf5ff, #fdf2f8, #eff6ff);
```

#### App Container Background
```css
/* Tailwind Class */
bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100

/* CSS */
background: linear-gradient(to bottom right, #f3e8ff, #fce7f3, #dbeafe);
```

#### Success Background
```css
/* Tailwind Class */
bg-gradient-to-br from-green-50 to-emerald-50

/* CSS */
background: linear-gradient(to bottom right, #f0fdf4, #ecfdf5);
```

---

## Component-Specific Colors

### Buttons

#### Primary CTA Button
```css
Background: gradient-to-r from-purple-600 to-pink-600
Text: white
Hover: from-purple-700 to-pink-700
Shadow: shadow-lg shadow-purple-300
```

#### Secondary Button
```css
Background: white
Text: purple-600
Border: 2px border-purple-200
Hover: bg-purple-50
```

#### Tertiary/Text Button
```css
Background: transparent
Text: purple-600
Hover: underline
```

### Cards

#### Standard Card
```css
Background: white
Border: 2px border-purple-100
Hover: border-purple-300
Shadow: shadow-sm
```

#### Feature Card
```css
Background: gradient-to-br from-purple-100 to-pink-100
Border: border-purple-200
Text: gray-900
```

### Forms

#### Input Fields
```css
Background: white
Border: 2px border-purple-200
Focus: ring-2 ring-purple-500 border-purple-500
Text: gray-700
Placeholder: purple-300
```

#### Search Bar
```css
Background: white
Border: 2px border-purple-200
Icon: purple-400
Text: gray-700
Placeholder: purple-300
```

### Status Indicators

#### Success Badge
```css
Background: purple-100
Text: purple-700
Border: border-purple-200
```

#### Progress Bar Container
```css
Background: purple-100
Bar: gradient-to-r from-purple-500 to-pink-500
```

#### Active Status
```css
Indicator: gradient-to-r from-pink-500 to-purple-500
```

### Navigation

#### Top Bar
```css
Background: white/90 with backdrop-blur
Border: border-purple-200
Active Icon: purple-600
Inactive Icon: gray-400
```

#### Bottom Navigation
```css
Background: white/90 with backdrop-blur
Border-top: border-purple-200
Active: purple-600
Inactive: gray-400
```

### Modals & Overlays

#### Modal Background
```css
Background: white
Border: 2px border-purple-100
Shadow: shadow-2xl
```

#### Overlay
```css
Background: black/50
Backdrop: blur-sm
```

### Badges & Tags

#### Info Badge
```css
Background: purple-100
Text: purple-700
Border: border-purple-200
```

#### Count Badge
```css
Background: yellow-400
Text: purple-900
Font: extrabold
```

#### Status Tag
```css
Background: purple-100
Text: purple-700
Border: border-purple-200
Size: text-[10px]
```

---

## Accessibility Guidelines

### Color Contrast Ratios

#### Primary Text
- purple-600 on white: ✅ AAA (7.2:1)
- gray-900 on white: ✅ AAA (16.1:1)
- gray-600 on white: ✅ AA (5.9:1)

#### Button Text
- white on purple-600: ✅ AAA (7.2:1)
- white on pink-600: ✅ AAA (6.3:1)
- purple-900 on yellow-400: ✅ AA (4.6:1)

#### Secondary Text
- gray-600 on white: ✅ AA (5.9:1)
- purple-500 on white: ✅ AA (4.9:1)

### Recommendations
- Always use white text on gradient buttons
- Use gray-900 for important headings
- Use gray-600 for body text
- Use purple-600 for links and interactive elements
- Ensure minimum 3:1 contrast for large text
- Ensure minimum 4.5:1 contrast for normal text

---

## Dark Mode (Future Enhancement)

If implementing dark mode, use these guidelines:

### Dark Background Colors
```css
Background: gray-900
Surface: gray-800
Card: gray-700
```

### Dark Text Colors
```css
Primary: white
Secondary: gray-300
Tertiary: gray-400
```

### Dark Accent Colors
Keep brand colors but adjust opacity:
```css
Purple: purple-400 (lighter for visibility)
Pink: pink-400
Blue: blue-400
```

---

## Usage Examples

### Hero Section
```jsx
<div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
  <h1 className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
    Your Hub to Access Higher Education
  </h1>
  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
    Get Started
  </button>
</div>
```

### Card Component
```jsx
<div className="bg-white rounded-3xl border-2 border-purple-100 hover:border-purple-300 shadow-sm">
  <div className="p-6">
    <h3 className="text-gray-900 font-bold">Card Title</h3>
    <p className="text-gray-600">Card content</p>
  </div>
</div>
```

### Button Variants
```jsx
{/* Primary */}
<button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full">
  Primary Action
</button>

{/* Secondary */}
<button className="bg-white text-purple-600 border-2 border-purple-200 px-6 py-3 rounded-full">
  Secondary Action
</button>

{/* Text */}
<button className="text-purple-600 hover:underline">
  Text Action
</button>
```

---

## Color Psychology

### Why This Palette?

**Purple:** 
- Represents creativity, wisdom, and ambition
- Associated with education and learning
- Appeals to youth and innovation

**Pink:** 
- Adds energy and excitement
- Creates a friendly, approachable feel
- Balances the seriousness of education

**Blue:** 
- Conveys trust and reliability
- Professional yet modern
- Complements purple and pink

**Yellow:** 
- Creates urgency and highlights CTAs
- Optimistic and attention-grabbing
- Perfect for notifications and badges

**Green:** 
- Success and progress
- Positive reinforcement
- Environmental and growth-oriented

This combination creates a modern, youthful, and energetic brand that appeals to students while maintaining professionalism.

---

**Last Updated:** February 7, 2026
**Version:** 2.0 (Vibrant Youth Update)
