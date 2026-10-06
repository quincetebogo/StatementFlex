# 🔄 Statement Download Strategies

## Question: What if customers want to download their statement again?

There are several approaches, each with different trade-offs:

---

## ✅ **Current Implementation: Multiple Downloads Per Token**

### Configuration:
```csharp
expirationMinutes: 60     // 1 hour
maxDownloads: 5          // 5 downloads per token
```

### How it works:
1. Customer clicks "View Statements" → Gets download links with tokens
2. Customer downloads a statement (1/5 used)
3. Customer can download **4 more times** using the same link
4. After 1 hour OR 5 downloads, token expires
5. To get fresh links: Click "View Statements" again

### ✅ Pros:
- **User-friendly**: Link works multiple times
- **Reduces API calls**: Don't need to regenerate tokens constantly
- **Handles download failures**: If download fails, customer can retry
- **Good for email links**: Can email the link and use it multiple times

### ⚠️ Cons:
- Slightly less secure (but still very secure)
- Token could be shared (but only works 5 times in 1 hour)

### 🎯 **Best for**: Most production applications

---

## Option 2: **Single-Use Tokens + Easy Regeneration**

### Configuration:
```csharp
expirationMinutes: 15     // 15 minutes
maxDownloads: 1          // One-time use
```

### How it works:
1. Customer clicks "View Statements" → Gets download links
2. Customer downloads a statement (token now used)
3. To download again: Click "View Statements" → New tokens generated
4. Download again with new token

### ✅ Pros:
- **Maximum security**: Each download uses unique token
- **Best audit trail**: Every download requires new token request
- **Link can't be shared effectively**: Single-use prevents sharing

### ⚠️ Cons:
- **Less convenient**: Need to go back to statement list for each download
- **More API calls**: Every download requires token regeneration
- **Poor for failed downloads**: If download fails, need new token

### 🎯 **Best for**: Maximum security scenarios (banking apps)

---

## Option 3: **Long-Lived Tokens**

### Configuration:
```csharp
expirationMinutes: 43200  // 30 days
maxDownloads: 100        // Essentially unlimited
```

### How it works:
1. Customer clicks "View Statements" → Gets download links
2. Links work for 30 days, unlimited downloads
3. Can bookmark or email the link

### ✅ Pros:
- **Maximum convenience**: Set it and forget it
- **Email-friendly**: Send in emails, works for weeks
- **Bookmark-able**: Customers can save links

### ⚠️ Cons:
- **Security risk**: Long-lived tokens are vulnerable
- **Link sharing**: Easy to share with others
- **Not recommended**: Fails security best practices

### 🎯 **Best for**: Internal apps, low-security scenarios

---

## Option 4: **Persistent Download Links** (Alternative Architecture)

Instead of temporary tokens, use authenticated downloads only.

### How it works:
```
GET /api/StatementFlex/download-statement/{statementId}
Authorization: Bearer {JWT}
```

1. Remove anonymous downloads entirely
2. Every download requires JWT authentication
3. Controller validates user owns the statement
4. Direct download from storage

### ✅ Pros:
- **Simpler architecture**: No token management needed
- **Always works**: As long as JWT is valid
- **Audit trail**: Tied to user authentication

### ⚠️ Cons:
- **Not shareable**: Can't send download links
- **Requires authentication**: Must be logged in to download
- **No email links**: Can't email statement links

### 🎯 **Best for**: Applications where statements are never shared

---

## 📊 Comparison Table

| Strategy | Security | Convenience | Shareable | Email Links | Audit Trail |
|----------|----------|-------------|-----------|-------------|-------------|
| **Current (Multi-use)** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Limited | ✅ Yes | ⭐⭐⭐⭐ |
| Single-use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ No | ⚠️ Once | ⭐⭐⭐⭐⭐ |
| Long-lived | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ Yes | ✅ Yes | ⭐⭐ |
| Authenticated Only | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ No | ❌ No | ⭐⭐⭐⭐⭐ |

---

## 🎯 Recommended Settings by Use Case

### **Banking / Financial Services**
```csharp
expirationMinutes: 30
maxDownloads: 3
enableIpValidation: true  // Lock to customer's IP
```

### **Standard Business Application** (Current)
```csharp
expirationMinutes: 60
maxDownloads: 5
enableIpValidation: false
```

### **Internal Tools**
```csharp
expirationMinutes: 1440   // 24 hours
maxDownloads: 10
enableIpValidation: false
```

### **Maximum Security (Compliance-heavy)**
```csharp
expirationMinutes: 15
maxDownloads: 1
enableIpValidation: true
```

---

## 🔧 How to Change Configuration

Edit `/src/StatementFlex/StatementFlex.Application/Services/ProduceStatements.cs`:

```csharp
var token = await _downloadTokenService.GenerateDownloadTokenAsync(
    statement.StatementId,
    customerId,
    ipAddress,
    enableIpValidation: false,    // ← Change these
    expirationMinutes: 60,        // ← values to
    maxDownloads: 5               // ← configure behavior
);
```

---

## 💡 Best Practice: Environment-Based Configuration

Instead of hardcoding, use appsettings.json:

```json
{
  "DownloadTokenSettings": {
    "ExpirationMinutes": 60,
    "MaxDownloads": 5,
    "EnableIPValidation": false
  }
}
```

Then inject via `IConfiguration`:
```csharp
var tokenSettings = _configuration.GetSection("DownloadTokenSettings");
var expirationMinutes = tokenSettings.GetValue<int>("ExpirationMinutes", 60);
var maxDownloads = tokenSettings.GetValue<int>("MaxDownloads", 5);
```

---

## 📝 Summary

**Current Implementation** (60 min, 5 downloads) strikes a good balance:
- ✅ Secure enough for most financial applications
- ✅ Convenient for customers
- ✅ Handles download failures gracefully
- ✅ Works well with email notifications
- ✅ Complete audit trail maintained

**If customer wants to download again:**
1. Within 1 hour → Just use the same link (works 5 times)
2. After 1 hour OR 5 downloads → Go to "View Statements" for new links

This is the **recommended production configuration**! 🚀
