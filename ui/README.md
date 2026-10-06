# 🎨 StatementFlex Testing UI

A comprehensive React-based testing interface for the StatementFlex financial statement management system.

## Features

- **🔐 Authentication Panel**
  - User registration with validation
  - User login with JWT token generation
  - Automatic session management

- **📄 Statements Panel**
  - View all available statements for the logged-in user
  - Request time-limited download tokens
  - Download statements as PDF files
  - Real-time refresh

- **⚙️ Admin Tools**
  - JWT token validation and inspection
  - Download token generation testing
  - Complete API documentation
  - Live endpoint reference

- **🎯 Testing Utilities**
  - Rate limiting verification
  - Security testing tools
  - Audit log inspection
  - Performance monitoring

## Quick Start

### Installation

```bash
cd ui
npm install
```

### Development Server

```bash
npm run dev
```

Opens http://localhost:3000 automatically.

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
ui/
├── src/
│   ├── main.jsx                    # Entry point
│   ├── App.jsx                     # Main application component
│   ├── index.css                   # Global styles
│   └── components/
│       ├── AuthPanel.jsx           # Login/Register
│       ├── StatementsPanel.jsx     # Statement management
│       └── AdminPanel.jsx          # Testing tools
├── index.html                       # HTML template
├── vite.config.js                  # Vite configuration
├── package.json                     # Dependencies
└── .gitignore
```

## Configuration

### API Proxy

The Vite dev server proxies all `/api` requests to the backend:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:5006',
    changeOrigin: true
  }
}
```

Change the target URL if your backend runs on a different port.

### Backend URL

For production builds, update the API base URL in your application or environment variables.

## Key Components

### AuthPanel Component

Handles user authentication:
- Registration with validation
- Login with JWT token storage
- Error handling and user feedback
- Test credentials helper

**Props:**
- `onLogin(token)` - Callback when user successfully logs in

### StatementsPanel Component

Displays and manages statements:
- Fetches statement list from backend
- Requests download tokens
- Handles PDF downloads
- Shows audit trail information

**Props:**
- `token` - JWT authentication token
- `user` - Decoded user information from JWT

### AdminPanel Component

Testing and debugging tools:
- JWT token decoder
- Token generation testing
- API endpoint documentation
- Status code reference

**Props:**
- `token` - JWT authentication token
- `user` - Decoded user information from JWT

## API Integration

The UI communicates with the StatementFlex API:

### Authentication
```javascript
POST /api/auth/login
POST /api/auth/register
```

### Statements
```javascript
GET /api/statementflex/statement-list
GET /api/statementflex/download/{token}
```

## State Management

Uses React Hooks for state management:
- `useState` - Component state
- `useEffect` - Side effects and initialization
- `localStorage` - Persistent JWT token storage

JWT tokens are automatically:
- Stored in localStorage on login
- Retrieved on page refresh
- Cleared on logout

## Styling

Modern, responsive CSS with:
- CSS Grid for layouts
- Flexbox for components
- CSS variables for theming
- Mobile-first design
- Gradient backgrounds

### Color Scheme
- Primary: `#667eea` (Blue)
- Secondary: `#764ba2` (Purple)
- Success: `#4caf50` (Green)
- Error: `#f44336` (Red)
- Warning: `#ff9800` (Orange)

## Error Handling

Comprehensive error handling for:
- Network failures
- Invalid credentials
- Rate limiting
- Token expiration
- Missing statements
- Download failures

Errors are displayed in context-specific alerts with:
- Clear error messages
- Suggested actions
- Error details for debugging

## Performance

- Minimal dependencies (React, Axios)
- Fast hot module replacement (HMR) with Vite
- Efficient API requests
- Local storage for session persistence
- Optimized re-renders with React hooks

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## Troubleshooting

### "Cannot connect to backend"
- Verify backend is running on http://localhost:5006
- Check network tab in browser dev tools
- Verify proxy configuration in vite.config.js

### "CORS errors"
- Ensure backend CORS is configured
- Check proxy settings in vite.config.js
- Restart dev server

### "Token not persisting"
- Check localStorage is enabled
- Verify browser privacy settings
- Check for browser storage quota

### "Statements won't load"
- Verify user is logged in
- Check backend database has statements
- Review network tab for API errors

## Development

### Hot Module Replacement (HMR)
Changes to component files automatically reload in the browser without losing state.

### Debug Mode
Use browser developer tools:
1. Open DevTools (F12)
2. Check Console for errors
3. Inspect Network tab for API calls
4. View Storage tab for JWT token

### Local Testing

Test against different backend states:
- Fresh database (no statements)
- With seed data loaded
- With active statements
- With expired tokens

## Deployment

### Build for Production
```bash
npm run build
```

Creates optimized `dist/` folder ready for deployment to:
- Netlify
- Vercel
- GitHub Pages
- S3 + CloudFront
- Docker
- Traditional web servers

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Security Considerations

- JWT tokens stored in localStorage (note: not HttpOnly)
- HTTPS required for production
- CORS properly configured on backend
- Input validation on all forms
- No sensitive data logged to console
- Rate limiting enforced on backend

For production deployments with HttpOnly cookies, consider:
- Backend sets JWT in HttpOnly cookie
- UI sends credentials with requests
- CSRF token implementation

## Contributing

When adding new features:
1. Create new component in `src/components/`
2. Follow existing code style
3. Add error handling
4. Test with real API
5. Update documentation

## License

Same as main StatementFlex project

## Support

For issues or questions:
1. Check [TESTING_SETUP.md](../TESTING_SETUP.md)
2. Review browser console errors
3. Check backend logs
4. Verify database state

---

**Related Documentation:**
- [Main Testing Guide](../TESTING_SETUP.md)
- [Project Overview](../PROJECT_OVERVIEW.md)
- [Architecture](../PROJECT_OVERVIEW.md#-architecture)
- [Security](../SECURITY.md)
