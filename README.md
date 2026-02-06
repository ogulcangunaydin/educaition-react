# Educaition - Test Management Platform

A comprehensive test management system built with React, supporting multiple test types including Personality Tests, Cognitive Dissonance Tests, Prisoner's Dilemma experiments, and University Comparison tools.

## Table of Contents

- [Architecture](#architecture)
  - [Project Structure](#project-structure)
  - [Atomic Design Pattern](#atomic-design-pattern)
  - [Path Aliases](#path-aliases)
- [Authentication](#authentication)
  - [Login System](#login-system)
  - [Role-Based Access Control](#role-based-access-control)
  - [Protected Routes](#protected-routes)
- [Internationalization (i18n)](#internationalization-i18n)
- [Test Modules](#test-modules)
- [Development](#development)
- [Deployment](#deployment)

---

## Architecture

### Project Structure

```
src/
├── components/              # Reusable UI components (Atomic Design)
│   ├── atoms/              # Basic building blocks (Button, TextField, etc.)
│   ├── molecules/          # Combinations of atoms (FormField, SearchInput, etc.)
│   ├── organisms/          # Complex components (Header, DataTable, etc.)
│   ├── templates/          # Page layouts (AuthLayout, PageLayout, etc.)
│   └── index.js            # Central export point
│
├── contexts/               # React Context providers
│   ├── AuthContext.js      # Authentication state
│   ├── BasketContext.js    # University basket state
│   └── UniversityContext.js # University selection state
│
├── hooks/                  # Custom React hooks
│   ├── index.js            # Hook exports
│   ├── useApi.js           # API call wrapper
│   ├── useDebounce.js      # Debounce utility
│   ├── useForm.js          # Form state management
│   └── useLocalStorage.js  # LocalStorage wrapper
│
├── i18n/                   # Internationalization
│   ├── index.js            # i18n configuration
│   └── locales/            # Translation files
│       ├── en/             # English translations
│       └── tr/             # Turkish translations
│
├── pages/                  # Page components (routes)
│   ├── auth/               # Authentication pages
│   ├── prisoners-dilemma/  # Prisoner's Dilemma module
│   ├── PersonalityTest/    # Personality Test module
│   └── ...                 # Other pages
│
├── services/               # API services
│   └── authService.js      # Authentication API
│
├── config/                 # App configuration
│   ├── index.js            # Config exports
│   └── permissions.js      # Role & permission definitions
│
├── data/                   # Static data & constants
│   └── testQuestions.js    # Test question definitions
│
├── theme/                  # MUI theme configuration
│
├── utils/                  # Utility functions
│
├── App.js                  # Main app component with routing
└── index.js                # App entry point
```

### Atomic Design Pattern

We follow the **Atomic Design** methodology for component organization:

| Level | Description | Examples | Location |
|-------|-------------|----------|----------|
| **Atoms** | Basic, indivisible UI elements | Button, TextField, Checkbox, Typography | `components/atoms/` |
| **Molecules** | Combinations of atoms | FormField, SearchInput, LanguageSwitcher | `components/molecules/` |
| **Organisms** | Complex, self-contained components | Header, DataTable, FilterPanel | `components/organisms/` |
| **Templates** | Page layouts without specific content | AuthLayout, PageLayout, TestLayout | `components/templates/` |
| **Pages** | Specific instances of templates | Login, Dashboard, TestManagement | `pages/` |

#### Rules

1. **Atoms** should have no dependencies on other custom components
2. **Molecules** can only import atoms
3. **Organisms** can import atoms and molecules
4. **Templates** can import atoms, molecules, and organisms
5. **Pages** can import from any level

### Path Aliases

Configured in `jsconfig.json` for cleaner imports:

```javascript
// Instead of:
import Button from "../../../components/atoms/Button";

// Use:
import Button from "@atoms/Button";
import { FormField } from "@molecules";
import { Header } from "@organisms";
import { PageLayout } from "@templates";
```

| Alias | Path |
|-------|------|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@atoms/*` | `src/components/atoms/*` |
| `@molecules/*` | `src/components/molecules/*` |
| `@organisms/*` | `src/components/organisms/*` |
| `@templates/*` | `src/components/templates/*` |
| `@hooks` | `src/hooks/index.js` |
| `@services/*` | `src/services/*` |
| `@contexts/*` | `src/contexts/*` |
| `@config` | `src/config/index.js` |
| `@pages/*` | `src/pages/*` |
| `@data/*` | `src/data/*` |
| `@i18n` | `src/i18n/index.js` |

---

## Authentication

### Login System

The application has **two separate login portals** to separate concerns:

| Portal | URL | Purpose | Logo |
|--------|-----|---------|------|
| **Educaition** | `/login` | Test management for teachers/admins | educaition_logo.svg |
| **Haliç** | `/login-halic` | University comparison for viewers | halic_universitesi_logo.svg |

#### Login Flow

```
┌─────────────────┐
│  /login         │ ──── Admin/Teacher ────► /dashboard
│  (Educaition)   │
│                 │ ──── Viewer ────────────► ❌ Error (use /login-halic)
│                 │ ──── Student ───────────► ❌ Error (use test links)
└─────────────────┘

┌─────────────────┐
│  /login-halic   │ ──── Viewer ────────────► /university-comparison
│  (Haliç)        │
│                 │ ──── Admin/Teacher ────► /university-comparison
│                 │ ──── Student ───────────► ❌ Error
└─────────────────┘
```

#### Implementation

```javascript
// pages/auth/Login.js
<Login variant="educaition" />  // For /login
<Login variant="halic" />       // For /login-halic
```

### Role-Based Access Control

| Role | Description | Accessible Features |
|------|-------------|---------------------|
| **Admin** | System administrator | All features including user management |
| **Teacher** | Test creator/manager | Dashboard, Test Management, Room creation, Results |
| **Viewer** | University comparison user | University Comparison only |
| **Student** | Test participant | Test pages via direct links (no login required) |

#### Permission Configuration

```javascript
// config/permissions.js
export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher", 
  VIEWER: "viewer",
  STUDENT: "student",
};

export const TEST_TYPES = {
  PERSONALITY: "personality",
  DISSONANCE: "dissonance",
  PRISONERS_DILEMMA: "prisoners-dilemma",
  PROGRAM_SUGGESTION: "program-suggestion",
};
```

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```javascript
// Only admin and teacher can access
<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]}>
  <Dashboard />
</ProtectedRoute>

// All authenticated users
<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER, ROLES.VIEWER]}>
  <UniversityComparison />
</ProtectedRoute>
```

---

## Internationalization (i18n)

### Supported Languages

- 🇹🇷 Turkish (tr) - Default
- 🇬🇧 English (en)

### Translation Structure

```
src/i18n/
├── index.js                 # i18n configuration
└── locales/
    ├── en/
    │   ├── index.js         # Aggregates all EN modules
    │   ├── common.js        # Common UI terms
    │   ├── auth.js          # Authentication texts
    │   ├── navigation.js    # Nav/header/footer
    │   ├── validation.js    # Form validation messages
    │   └── tests.js         # Test-related texts
    └── tr/
        └── (same structure)
```

### Usage

```javascript
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t("auth.educaition.welcomeTitle")}</h1>
      <p>{t("common.loading")}</p>
      <span>{t("validation.required")}</span>
    </div>
  );
}
```

### Language Switching

The `LanguageSwitcher` component is available in the header:

```javascript
import { LanguageSwitcher } from "@molecules";

<LanguageSwitcher variant="flag" />  // Shows flag icons
<LanguageSwitcher variant="icon" />  // Shows language icon
```

---

## Test Modules

### Available Tests

| Test | Description | Public Access |
|------|-------------|---------------|
| **Personality Test** | Big Five personality assessment | `/personality-test/:roomId` |
| **Dissonance Test** | Cognitive dissonance evaluation | `/dissonance-test/:roomId` |
| **Prisoner's Dilemma** | Game theory experiment | `/prisoners-dilemma/:roomId` |
| **Program Suggestion** | University program recommendation | Via test link |

### Test Flow

1. **Teacher creates a room** via Test Management
2. **Room generates a QR code/link** for participants
3. **Participants access via public URL** (no login required)
4. **Device tracking** prevents duplicate submissions
5. **Results available** in room detail page

### Public Test Pages

Public test pages follow this pattern:

```
/[test-type]/:roomId

Examples:
/personality-test/abc123
/dissonance-test/xyz789
/prisoners-dilemma/game42
```

---

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Running Locally

```bash
npm start
# Opens at http://localhost:8080
```

### Code Quality

```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

### Project Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start development server (port 8080) |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Fix linting errors |
| `npm run format` | Format code with Prettier |

---

## Deployment

### Build

```bash
npm run build
```

### Environment Variables

Create `.env` files for different environments:

```env
# .env.development
REACT_APP_API_URL=http://localhost:8000

# .env.production
REACT_APP_API_URL=https://api.educaition.net.tr
```

### PM2 (Production)

```bash
pm2 start ecosystem.config.js
```

---

## Contributing

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

### Commit Messages

Follow conventional commits:

```
feat: add language switcher component
fix: resolve login redirect issue
refactor: reorganize auth pages
docs: update README with architecture
```

---

## License

Proprietary - Haliç University

---

## Changelog

### 2026-02-06

- ✅ Implemented i18n with Turkish/English support
- ✅ Created unified Login component with dual portal support
- ✅ Reorganized component architecture (Atomic Design)
- ✅ Added LanguageSwitcher component
- ✅ Cleaned up unused modules and legacy files
- ✅ Moved assets to public folder
- ✅ Updated path aliases in jsconfig.json
