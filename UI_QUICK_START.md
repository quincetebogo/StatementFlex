# 🚀 UI Quick Start - 5 Minutes to Testing

Get the complete StatementFlex testing UI and backend running in 5 minutes.

## Step 1: Start Infrastructure (1 min)

```bash
cd /Users/QuinceNgomane/StatementFlex
docker-compose up
```

Wait for healthy status:
```
✅ statementflex-postgres is healthy
✅ statementflex-minio is healthy
✅ statementflex-minio-init completed
```

## Step 2: Start Backend (1 min)

In a new terminal:

```bash
cd /Users/QuinceNgomane/StatementFlex/src/StatementFlex/StatementFlex.API
dotnet run
```

Wait for:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5006
```

## Step 3: Start Frontend (1 min)

In a new terminal:

```bash
cd /Users/QuinceNgomane/StatementFlex/ui
npm install
npm run dev
```

Wait for:
```
  VITE v5.0.0  ready in 234 ms
  ➜  Local:   http://localhost:3000/
```

## Step 4: Open Browser (30 sec)

Click here: **[http://localhost:3000](http://localhost:3000)**

## Step 5: Test Everything (1.5 min)

### Register Account
1. Click "Need an account? Register"
2. Fill in form:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Account: `1234567890`
   - Password: `SecurePass123!`
3. Click "Register"

### Generate Statements
Open new tab: **[http://localhost:5006/hangfire](http://localhost:5006/hangfire)**
- Find "GenerateAndStoreStatements" job
- Click "Trigger job now"
- Wait ~5 seconds

### Download Statement
Back to UI tab:
1. Click "🔄 Refresh"
2. Should see statement in list
3. Click "🔐 Get Token"
4. Click "⬇️ Download"
5. PDF downloads! ✅

## 🎯 What You Can Test

- ✅ User registration and login
- ✅ JWT authentication
- ✅ Statement listing
- ✅ Secure token generation
- ✅ PDF downloads
- ✅ Rate limiting
- ✅ Token expiration
- ✅ Audit logging
- ✅ Security features

## 📊 Dashboard Access

While testing, you can also monitor:

| Component | URL | Login |
|-----------|-----|-------|
| **API Docs** | http://localhost:5006/openapi-ui | None |
| **Background Jobs** | http://localhost:5006/hangfire | None |
| **File Storage** | http://localhost:9001 | minioadmin / minioadmin |

## ❌ Troubleshooting

### "Cannot connect to database"
```bash
docker-compose down -v
docker-compose up
# Wait for healthy status
```

### "Port 3000 already in use"
```bash
# Kill process
lsof -ti:3000 | xargs kill -9
```

### "Frontend won't connect to backend"
```bash
# Verify proxy in vite.config.js is set to localhost:5006
# Check backend is running: curl http://localhost:5006/health
```

### "No statements showing"
```bash
# Check database has test data
psql -h localhost -p 58344 -U myuser -d statementflex -c \
  "SELECT COUNT(*) FROM statements;"
# If 0, trigger Hangfire job or load seed data
```

## 🔗 Full Documentation

For comprehensive testing guide, see: **[TESTING_SETUP.md](./TESTING_SETUP.md)**

## 💡 Pro Tips

1. **Keep browser DevTools open** - Watch network requests in real-time
2. **Use Admin Tools tab** - See API responses and status codes
3. **Check Hangfire dashboard** - Monitor background job execution
4. **View MinIO console** - See uploaded PDF files
5. **Query database directly** - Run SQL to verify data

## 🎓 Architecture

The complete stack:

```
Frontend (React)          Backend (.NET 9)         Infrastructure
http://localhost:3000     http://localhost:5006    ├─ PostgreSQL
                                                   ├─ MinIO
├─ Login/Register         ├─ Authentication        └─ Hangfire
├─ View Statements        ├─ Statement Service
├─ Download Files         ├─ Download Tokens
└─ Admin Tools            └─ Background Jobs
```

---

**Ready to test?** Open http://localhost:3000 now! 🚀

