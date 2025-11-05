# Luxury UI/UX Design System - ACMS

## Design Philosophy: "Addictive Luxury"

Creating an experience so polished, so delightful, that users **want** to use the system. Every interaction should feel premium, smooth, and rewarding.

## Core Principles

### 1. **Visual Delight**
- Subtle animations everywhere
- Gradient accents
- Smooth shadows
- Premium color palette

### 2. **Information Richness**
- Data visualization
- Smart insights
- Contextual information
- Progressive disclosure

### 3. **Effortless Interaction**
- Intuitive flows
- Predictive actions
- Smart defaults
- Minimal clicks

### 4. **Emotional Connection**
- Micro-interactions
- Delightful feedback
- Personality in copy
- Rewarding experiences

## Design Tokens

### Color Palette

#### Primary Colors
```css
--blue-50: #eff6ff
--blue-100: #dbeafe
--blue-500: #3b82f6
--blue-600: #2563eb
--blue-700: #1d4ed8
```

#### Success/Health
```css
--green-50: #f0fdf4
--green-100: #dcfce7
--green-500: #22c55e
--green-600: #16a34a
```

#### Warning/Alert
```css
--orange-50: #fff7ed
--orange-100: #ffedd5
--orange-500: #f97316
--orange-600: #ea580c
```

#### Danger/Critical
```css
--red-50: #fef2f2
--red-100: #fee2e2
--red-500: #ef4444
--red-600: #dc2626
```

#### Neutral/Elegant
```css
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-500: #6b7280
--gray-900: #111827
```

#### Luxury Gradients
```css
--gradient-luxury: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--gradient-success: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)
--gradient-sunset: linear-gradient(135deg, #fa709a 0%, #fee140 100%)
--gradient-ocean: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)
```

### Typography

#### Font Family
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

#### Font Sizes
```css
--text-xs: 0.75rem (12px)
--text-sm: 0.875rem (14px)
--text-base: 1rem (16px)
--text-lg: 1.125rem (18px)
--text-xl: 1.25rem (20px)
--text-2xl: 1.5rem (24px)
--text-3xl: 1.875rem (30px)
--text-4xl: 2.25rem (36px)
```

#### Font Weights
```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
--font-extrabold: 800
```

### Spacing Scale
```css
--space-1: 0.25rem (4px)
--space-2: 0.5rem (8px)
--space-3: 0.75rem (12px)
--space-4: 1rem (16px)
--space-6: 1.5rem (24px)
--space-8: 2rem (32px)
--space-12: 3rem (48px)
```

### Border Radius
```css
--radius-sm: 0.375rem (6px)
--radius-md: 0.5rem (8px)
--radius-lg: 0.75rem (12px)
--radius-xl: 1rem (16px)
--radius-2xl: 1.5rem (24px)
--radius-full: 9999px
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
--shadow-luxury: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

## Component Patterns

### 1. **Luxury Card**
```jsx
<div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
  {/* Content */}
</div>
```

**Features:**
- Large border radius (2xl)
- Subtle shadow that grows on hover
- Border color transition
- Smooth animation

### 2. **Stats Card**
```jsx
<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
  <div className="flex items-center justify-between mb-3">
    <Icon className="h-6 w-6 text-blue-600" />
    <span className="text-3xl font-bold text-gray-900">{value}</span>
  </div>
  <p className="text-sm text-gray-600">{label}</p>
  <div className="mt-2 flex items-center text-xs">
    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
    <span className="text-green-600">+12%</span>
    <span className="text-gray-500 ml-1">vs last month</span>
  </div>
</div>
```

**Features:**
- Gradient background
- Icon + large number
- Trend indicator
- Contextual comparison

### 3. **Search Bar (Premium)**
```jsx
<div className="relative group">
  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
  </div>
  <input
    type="text"
    className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
    placeholder="Search with AI-powered suggestions..."
  />
</div>
```

**Features:**
- Icon color change on focus
- Background color transition
- Ring effect on focus
- Premium placeholder text

### 4. **Action Button (Luxury)**
```jsx
<button className="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-semibold text-white transition-all duration-300 ease-out bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:scale-105 hover:shadow-xl active:scale-95">
  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"></span>
  <Icon className="relative h-5 w-5 mr-2" />
  <span className="relative">Add New</span>
</button>
```

**Features:**
- Gradient background
- Hover scale effect
- Gradient overlay on hover
- Active press effect

### 5. **Data Table (Elegant)**
```jsx
<div className="overflow-hidden rounded-xl border border-gray-200">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Column
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-100">
      <tr className="hover:bg-blue-50 transition-colors cursor-pointer">
        <td className="px-6 py-4 whitespace-nowrap">
          {/* Content */}
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Features:**
- Gradient header
- Hover row highlight
- Rounded container
- Subtle dividers

### 6. **Badge/Pill**
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
  Active
</span>
```

**Features:**
- Dot indicator
- Rounded pill shape
- Color-coded
- Subtle border

## Page-Specific Patterns

### Patients Page

#### Patient Card
```jsx
<div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-300 cursor-pointer">
  <div className="flex items-start justify-between">
    {/* Avatar */}
    <div className="relative">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
        {initials}
      </div>
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
    </div>
    
    {/* Quick Actions */}
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="p-2 hover:bg-blue-50 rounded-lg">
        <MoreVertical className="h-4 w-4" />
      </button>
    </div>
  </div>
  
  {/* Patient Info */}
  <div className="mt-4">
    <h3 className="text-lg font-bold text-gray-900">{name}</h3>
    <p className="text-sm text-gray-500">{code}</p>
  </div>
  
  {/* Stats */}
  <div className="mt-4 grid grid-cols-3 gap-4">
    <div>
      <p className="text-xs text-gray-500">Age</p>
      <p className="text-sm font-semibold">{age}</p>
    </div>
    <div>
      <p className="text-xs text-gray-500">Visits</p>
      <p className="text-sm font-semibold">{visits}</p>
    </div>
    <div>
      <p className="text-xs text-gray-500">Last</p>
      <p className="text-sm font-semibold">{lastVisit}</p>
    </div>
  </div>
  
  {/* Tags */}
  <div className="mt-4 flex flex-wrap gap-2">
    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
      Vata
    </span>
  </div>
</div>
```

### Appointments Page

#### Timeline View
- Vertical timeline with connecting lines
- Color-coded status dots
- Hover to expand details
- Drag to reschedule

### Medicines Page

#### Inventory Card
```jsx
<div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
  {/* Stock Level Indicator */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-bold text-gray-900">{medicineName}</h3>
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-500 to-green-600" style={{width: `${stockPercentage}%`}}></div>
      </div>
      <span className="text-sm font-semibold">{stock}</span>
    </div>
  </div>
  
  {/* Quick Stats */}
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-blue-50 rounded-lg p-3">
      <p className="text-xs text-blue-600">Price</p>
      <p className="text-lg font-bold text-blue-900">₹{price}</p>
    </div>
    <div className="bg-purple-50 rounded-lg p-3">
      <p className="text-xs text-purple-600">Expiry</p>
      <p className="text-lg font-bold text-purple-900">{expiry}</p>
    </div>
  </div>
</div>
```

### Invoices Page

#### Financial Card
```jsx
<div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
  <div className="flex items-center justify-between mb-4">
    <div>
      <p className="text-sm text-green-600">Total Revenue</p>
      <p className="text-3xl font-bold text-green-900">₹{revenue}</p>
    </div>
    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
      <TrendingUp className="h-8 w-8 text-white" />
    </div>
  </div>
  
  <div className="flex items-center text-sm">
    <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
    <span className="text-green-600 font-semibold">+23.5%</span>
    <span className="text-gray-600 ml-2">from last month</span>
  </div>
</div>
```

## Micro-Interactions

### 1. **Button Press**
```css
.btn:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}
```

### 2. **Card Hover**
```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 3. **Loading Skeleton**
```jsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
</div>
```

### 4. **Success Animation**
```jsx
<div className="animate-bounce">
  <CheckCircle className="h-12 w-12 text-green-500" />
</div>
```

## Animation Principles

### Timing Functions
```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
--ease-in-out: cubic-bezier(0.4, 0, 0.6, 1)
```

### Durations
```css
--duration-fast: 150ms
--duration-normal: 300ms
--duration-slow: 500ms
```

## Accessibility

### Focus States
```css
.focusable:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.5rem;
}
```

### Color Contrast
- All text meets WCAG AA standards
- Minimum 4.5:1 contrast ratio
- Enhanced contrast for important actions

## Responsive Breakpoints

```css
--screen-sm: 640px
--screen-md: 768px
--screen-lg: 1024px
--screen-xl: 1280px
--screen-2xl: 1536px
```

## Implementation Priority

1. **Phase 1: Foundation** ✅
   - Design system documented
   - Color palette defined
   - Component patterns established

2. **Phase 2: Patients** (Next)
   - Rich patient cards
   - Advanced search
   - Quick actions
   - Stats dashboard

3. **Phase 3: Appointments**
   - Timeline view
   - Status management
   - Quick booking
   - Calendar integration

4. **Phase 4: Medicines**
   - Inventory visualization
   - Stock alerts
   - Expiry tracking
   - Quick reorder

5. **Phase 5: Invoices**
   - Financial insights
   - Payment tracking
   - Revenue charts
   - Export options

## Success Metrics

- **Visual Appeal**: 10/10 luxury feel
- **Interaction Speed**: < 100ms response
- **User Delight**: Addictive experience
- **Consistency**: Unified design language
- **Performance**: 60fps animations

This design system will make ACMS feel like a **premium, luxury healthcare platform**! 🌟
