# Frontend Architecture Guide

This document describes the frontend architecture of the Educaition React application, following Atomic Design principles and React best practices.

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components (Atomic Design)
│   ├── atoms/           # Basic building blocks
│   ├── molecules/       # Combinations of atoms
│   ├── organisms/       # Complex UI sections
│   └── templates/       # Page layouts
├── hooks/               # Custom React hooks
├── pages/               # Page components (routes)
├── contexts/            # React Context providers
├── services/            # API and external services
├── theme/               # Theme configuration
├── utils/               # Utility functions
└── assets/              # Static assets
```

## 🎨 Atomic Design

### Atoms (`components/atoms/`)

The smallest, indivisible UI elements. They can't be broken down further without losing their meaning.

| Component | Description |
|-----------|-------------|
| `Button` | Clickable button with loading state |
| `TextField` | Text input field |
| `Select` | Dropdown select |
| `Checkbox` | Checkbox with optional label |
| `Radio` | Radio button with optional label |
| `Slider` | Range slider |
| `Typography` | Text elements with variants |
| `Spinner` | Loading spinner |
| `Alert` | Alert/notification box |
| `Card` | Content card container |
| `Logo` | Logo image component |

**Usage:**
```jsx
import { Button, TextField, Alert } from '../components';

<Button variant="contained" loading={isSubmitting}>
  Submit
</Button>
```

### Molecules (`components/molecules/`)

Combinations of atoms that form functional UI groups.

| Component | Description |
|-----------|-------------|
| `FormField` | Labeled text input with validation |
| `RadioGroup` | Group of radio buttons |
| `CheckboxGroup` | Group of checkboxes |
| `SelectField` | Labeled select dropdown |
| `SliderField` | Labeled slider with value display |
| `SearchInput` | Search input with icon and clear |
| `StepIndicator` | Multi-step form indicator |
| `DataCard` | Data display card with stats |
| `LoadingOverlay` | Full-screen/container loading |
| `ErrorMessage` | Error display with retry |
| `EmptyState` | Empty data placeholder |

**Usage:**
```jsx
import { RadioGroup, FormField, LoadingOverlay } from '../components';

<RadioGroup
  label="Cinsiyet"
  value={gender}
  onChange={setGender}
  options={enums.genders}
/>
```

### Organisms (`components/organisms/`)

Complex components composed of molecules and atoms.

| Component | Description |
|-----------|-------------|
| `Header` | App header with nav and logout |
| `FormSection` | Form section with title |
| `MultiStepForm` | Multi-step form container |
| `DataTable` | Table with sorting/pagination |
| `FilterPanel` | Collapsible filter panel |
| `ChartContainer` | Chart wrapper with states |

**Usage:**
```jsx
import { DataTable, FilterPanel } from '../components';

<DataTable
  columns={columns}
  data={users}
  loading={loading}
  onRowClick={handleEdit}
/>
```

### Templates (`components/templates/`)

Page-level layouts that define structure.

| Template | Use Case |
|----------|----------|
| `PageLayout` | General page layout |
| `AuthLayout` | Login/register pages |
| `TestLayout` | Survey/test pages |
| `DashboardLayout` | Admin dashboard pages |

**Usage:**
```jsx
import { PageLayout } from '../components';

function MyPage() {
  return (
    <PageLayout
      title="My Page"
      loading={loading}
      error={error}
      onRetry={refetch}
    >
      <Content />
    </PageLayout>
  );
}
```

## 🎣 Custom Hooks (`hooks/`)

Reusable logic extracted into hooks.

### `useApi`
Handle API calls with loading/error states.

```jsx
const { data, loading, error, execute } = useApi(fetchUsers, {
  immediate: true,
  onSuccess: (data) => console.log('Loaded:', data),
});
```

### `useForm`
Manage form state and validation.

```jsx
const { values, errors, handleChange, handleSubmit } = useForm(
  { email: '', password: '' },
  {
    validate: (values) => {
      const errors = {};
      if (!values.email) errors.email = 'Email required';
      return errors;
    },
    onSubmit: async (values) => {
      await login(values);
    },
  }
);
```

### `useEnums`
Load and use enum values from API.

```jsx
const { enums, loading, getLabel } = useEnums(['genders', 'cities']);

// In JSX
{enums.genders.map(g => <MenuItem value={g.value}>{g.label}</MenuItem>)}
```

### `useMultiStepForm`
Manage multi-step form navigation.

```jsx
const {
  currentStep,
  goNext,
  goBack,
  isLastStep,
  progress,
} = useMultiStepForm(['Personal', 'Education', 'Preferences'], {
  validateStep: async (step) => {
    if (step === 0 && !values.name) return 'Name required';
    return null;
  },
});
```

### `useDebounce`
Debounce values or callbacks.

```jsx
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  search(debouncedSearch);
}, [debouncedSearch]);
```

### `useLocalStorage`
Persist state in localStorage.

```jsx
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

## 🎨 Theme (`theme/index.js`)

Centralized theme configuration using MUI's theming system.

```jsx
import { theme, COLORS, SPACING, SHADOWS } from '../theme';

// Use in components
<Box sx={{ 
  color: COLORS.primary.main,
  p: SPACING.md,
  boxShadow: SHADOWS.card 
}} />
```

### Color Palette
- **Primary**: `#001bc3` (Haliç blue)
- **Secondary**: `#6c757d`
- **Success/Error/Warning/Info**: Standard colors

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## 📝 Migration Guide

### Before (Old Pattern)
```jsx
// pages/MyPage.js
import { Button, TextField, Box, styled } from '@mui/material';

const StyledButton = styled(Button)({ ... });
const StyledTextField = styled(TextField)({ ... });

function MyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Lots of inline styles and repeated patterns
  return (
    <Box sx={{ minHeight: '100vh', p: 3 }}>
      <Header />
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      ...
    </Box>
  );
}
```

### After (New Pattern)
```jsx
// pages/MyPage.js
import { PageLayout, FormField, RadioGroup, Button } from '../components';
import { useApi, useForm, useEnums } from '../hooks';

function MyPage() {
  const { enums, loading: enumsLoading } = useEnums(['genders', 'cities']);
  const { data, loading, error, execute } = useApi(fetchData);
  const { values, handleChange, handleSubmit } = useForm(initialValues);
  
  return (
    <PageLayout loading={loading || enumsLoading} error={error}>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Name"
          value={values.name}
          onChange={handleChange}
        />
        <RadioGroup
          label="Gender"
          options={enums.genders}
          value={values.gender}
          onChange={handleChange}
        />
        <Button type="submit">Submit</Button>
      </form>
    </PageLayout>
  );
}
```

## 🚀 Best Practices

1. **Import from index**: Use `import { Button, Card } from '../components'`
2. **Use hooks for logic**: Extract repeated logic into custom hooks
3. **Use templates for layouts**: Don't repeat layout code in pages
4. **Use theme values**: Reference `COLORS`, `SPACING` from theme
5. **Prop types**: All components have PropTypes for documentation
6. **Composition over configuration**: Prefer composing components over complex props

## 📦 Creating New Components

1. Choose the appropriate level (atom/molecule/organism)
2. Create the component file with PropTypes
3. Export from the level's index.js
4. Add to the main components/index.js
5. Document usage in this README
