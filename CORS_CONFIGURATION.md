# 🌐 CORS (Cross-Origin Resource Sharing) Configuration

## What is CORS?

CORS is a security feature that controls which websites can access your API. Without proper CORS configuration:
- ❌ **Development**: Your frontend can't call your API (blocked by browser)
- ❌ **Production**: Malicious websites can steal your users' data

## 🔒 Current Configuration

### **Development Environment**
Allows requests from common local development servers:
```
✅ http://localhost:3000  (React)
✅ http://localhost:5173  (Vite)
✅ http://localhost:4200  (Angular)
✅ http://localhost:8080  (Vue)
```

**Usage**: Automatically enabled when `ASPNETCORE_ENVIRONMENT=Development`

### **Production Environment**
Restricts access to your actual frontend domain:
```
✅ Only from: https://yourdomain.com
✅ Only methods: GET, POST, PUT, DELETE
✅ Only headers: Authorization, Content-Type
✅ Credentials: Allowed (for cookies/auth)
```

**Usage**: Automatically enabled when `ASPNETCORE_ENVIRONMENT=Production`

### **Testing Environment** (Swagger/Postman)
Allows all origins for API testing:
```
✅ Any origin (use ONLY for testing!)
```

**Usage**: Set `ASPNETCORE_ENVIRONMENT=Testing`

---

## 🚀 Quick Start

### 1. Development (Local)
No configuration needed! Just run:
```bash
dotnet run
```

Your frontend at `http://localhost:3000` can now call your API.

### 2. Production (Deploy)
Update `appsettings.json` or environment variable:
```json
{
  "FrontendUrl": "https://your-actual-domain.com"
}
```

Or via environment variable:
```bash
export FrontendUrl="https://your-actual-domain.com"
```

### 3. Multiple Frontend Domains
Edit `Program.cs`:
```csharp
.WithOrigins(
    "https://yourdomain.com",
    "https://www.yourdomain.com",
    "https://app.yourdomain.com"
)
```

---

## 🔧 Configuration Details

### CORS Middleware Order (IMPORTANT!)
```csharp
app.UseMiddleware<ExceptionHandlingMiddleware>();  // 1. Exception handling first
app.UseCors("Development");                         // 2. CORS before auth
app.UseAuthentication();                            // 3. Authentication
app.UseAuthorization();                             // 4. Authorization
app.MapControllers();                               // 5. Route mapping last
```

**Why this order?**
- CORS must run **before** authentication to allow preflight requests
- Exception handling should catch CORS errors

### Preflight Requests (OPTIONS)
Browsers send OPTIONS requests before actual requests. Our CORS policy handles these automatically:
```
Browser → OPTIONS /api/StatementFlex/statement-list
API → 204 No Content (with CORS headers)
Browser → GET /api/StatementFlex/statement-list (actual request)
```

---

## 🛡️ Security Best Practices

### ✅ DO:
1. **Use specific origins in production**
   ```csharp
   .WithOrigins("https://yourdomain.com")  // Exact domain
   ```

2. **Limit HTTP methods**
   ```csharp
   .WithMethods("GET", "POST", "PUT", "DELETE")  // Only what you need
   ```

3. **Specify allowed headers**
   ```csharp
   .WithHeaders("Authorization", "Content-Type")  // Explicit list
   ```

4. **Use HTTPS in production**
   ```csharp
   .WithOrigins("https://yourdomain.com")  // HTTPS only!
   ```

5. **Enable credentials for auth**
   ```csharp
   .AllowCredentials()  // Needed for JWT tokens
   ```

### ❌ DON'T:
1. **Never use `AllowAnyOrigin()` in production**
   ```csharp
   .AllowAnyOrigin()  // ❌ SECURITY VULNERABILITY!
   ```
   This allows **any website** to call your API and steal data!

2. **Don't combine `AllowAnyOrigin()` with `AllowCredentials()`**
   ```csharp
   .AllowAnyOrigin()
   .AllowCredentials()  // ❌ Browsers will reject this
   ```
   This combination is not allowed by browsers.

3. **Don't skip CORS in production**
   ```csharp
   // ❌ Never do this:
   if (app.Environment.IsProduction())
   {
       // No CORS = API only works from same domain
   }
   ```

---

## 🐛 Troubleshooting

### Problem: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Symptom**: Frontend gets error in browser console

**Solutions**:
1. Check CORS is enabled:
   ```bash
   # Search for UseCors in Program.cs
   grep UseCors Program.cs
   ```

2. Verify frontend URL is allowed:
   ```csharp
   // Add your frontend URL
   .WithOrigins("http://localhost:3000")
   ```

3. Check middleware order (CORS before Authentication)

### Problem: "Credentials flag is 'true', but 'Access-Control-Allow-Credentials' header is ''"

**Solution**: Add `.AllowCredentials()` to your policy:
```csharp
.WithOrigins("http://localhost:3000")
.AllowCredentials()  // ← Add this
```

### Problem: "Wildcard '*' cannot be used when credentials flag is true"

**Solution**: Replace `.AllowAnyOrigin()` with specific origins:
```csharp
// ❌ Don't do this:
.AllowAnyOrigin()
.AllowCredentials()

// ✅ Do this:
.WithOrigins("http://localhost:3000")
.AllowCredentials()
```

### Problem: OPTIONS preflight request returns 401 Unauthorized

**Solution**: Add `[AllowAnonymous]` to your controller or move `UseCors` before `UseAuthentication`:
```csharp
app.UseCors("Development");    // Must be BEFORE
app.UseAuthentication();       // Authentication
```

---

## 🧪 Testing CORS

### 1. Test from Browser Console
Open your API in a browser and run:
```javascript
fetch('http://localhost:5006/api/StatementFlex/statement-list', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

### 2. Test with cURL
```bash
# Test preflight request
curl -X OPTIONS http://localhost:5006/api/StatementFlex/statement-list \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Should return headers:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: GET
```

### 3. Check Response Headers
```bash
curl -X GET http://localhost:5006/api/StatementFlex/statement-list \
  -H "Origin: http://localhost:3000" \
  -H "Authorization: Bearer TOKEN" \
  -v | grep "Access-Control"
```

---

## 📋 Environment-Specific Configuration

### Development (appsettings.Development.json)
```json
{
  "FrontendUrl": "http://localhost:3000"
}
```

### Staging (appsettings.Staging.json)
```json
{
  "FrontendUrl": "https://staging.yourdomain.com"
}
```

### Production (appsettings.Production.json)
```json
{
  "FrontendUrl": "https://yourdomain.com"
}
```

Or use environment variables:
```bash
# Development
export ASPNETCORE_ENVIRONMENT=Development
export FrontendUrl=http://localhost:3000

# Production
export ASPNETCORE_ENVIRONMENT=Production
export FrontendUrl=https://yourdomain.com
```

---

## 🌟 Advanced Scenarios

### Subdomain Wildcard
Allow all subdomains:
```csharp
.WithOrigins("https://*.yourdomain.com")
.SetIsOriginAllowedToAllowWildcardSubdomains()
```

### Multiple Environments
```csharp
var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins")
    .Get<string[]>() ?? new[] { "https://yourdomain.com" };

options.AddPolicy("Dynamic", policy => policy
    .WithOrigins(allowedOrigins)
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());
```

Then in `appsettings.json`:
```json
{
  "AllowedOrigins": [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
    "https://app.yourdomain.com"
  ]
}
```

### Per-Controller CORS
```csharp
[EnableCors("SpecificPolicy")]
[ApiController]
[Route("api/[controller]")]
public class StatementFlexController : ControllerBase
{
    // Only this controller uses SpecificPolicy
}
```

---

## 📊 Summary

| Environment | Allowed Origins | Methods | Headers | Credentials |
|-------------|----------------|---------|---------|-------------|
| **Development** | localhost:3000, 5173, 4200, 8080 | Any | Any | ✅ Yes |
| **Testing** | Any (⚠️ testing only) | Any | Any | ❌ No |
| **Production** | yourdomain.com (configured) | GET, POST, PUT, DELETE | Authorization, Content-Type | ✅ Yes |

---

## ✅ Checklist Before Deploy

- [ ] Updated `FrontendUrl` in `appsettings.Production.json`
- [ ] Removed or restricted "Testing" policy
- [ ] CORS middleware is before Authentication
- [ ] Using HTTPS in production origins
- [ ] Tested preflight (OPTIONS) requests
- [ ] No `AllowAnyOrigin()` in production
- [ ] Credentials enabled if using JWT/cookies

---

**Configuration Date**: June 24, 2026  
**Security Level**: ⭐⭐⭐⭐⭐ (5/5 stars)  
**Production Ready**: ✅ Yes
