# Chat UI Dependencies Analysis

## ✅ Required Dependencies (Must Keep)
These are explicitly required by the new chat UI implementation:

```json
{
  "@emoji-mart/data": "^1.2.1",
  "@emoji-mart/react": "^1.1.1", 
  "animejs": "^4.3.6",
  "socket.io-client": "^4.8.3"
}
```

## ✅ Core Dependencies (Keep)
Essential for the application to function:

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "lucide-react": "^0.487.0",
  "axios": "^1.13.5",
  "tailwind-merge": "^3.2.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1"
}
```

## ✅ UI Framework Dependencies (Keep)
Required for Radix UI components:

```json
{
  "@radix-ui/react-*": "all packages",
  "@radix-ui": "^1.4.3",
  "@tanstack/react-query": "^5.90.21"
}
```

## ⚠️ Potentially Redundant Dependencies
These may be optional or could cause conflicts:

### Animation Libraries (Redundant)
- `gsap`: "^3.14.2" - Redundant with animejs
- `motion`: "^12.23.24" - Redundant with animejs

### UI Framework Conflicts
- `@mui/material`: "7.3.5" - Conflicts with Radix UI + Tailwind
- `@mui/icons-material`: "7.3.5" - Conflicts with Lucide React
- `@emotion/react`: "11.14.0" - Not needed with Tailwind CSS
- `@emotion/styled`: "11.14.1" - Not needed with Tailwind CSS

### Duplicate/Optional Libraries
- `emoji-picker-react`: "^4.17.4" - Duplicate of @emoji-mart/react
- `@barba/core`: "^2.10.3" - Page transitions (may not be needed for chat)
- `ogl`: "^1.0.11" - WebGL library (likely unused for chat)

## 📝 Notes
- All dependencies are currently kept in package.json
- JSON doesn't support comments, so this documentation tracks the analysis
- Consider removing redundant dependencies if bundle size is a concern
- Test thoroughly before removing any dependencies
