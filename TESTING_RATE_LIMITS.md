# 🧪 Rate Limiting Test Guide

## 📋 Test Scripts Available

I've created **3 test scripts** for you:

### 1. **Interactive Bash Script** (Recommended)
```bash
./test-rate-limit.sh
```

**Features:**
- ✅ Interactive menu
- ✅ Automatic JWT token generation
- ✅ Multiple test scenarios
- ✅ Colored output
- ✅ Real-time results

**Tests Available:**
1. Statement List endpoint (authenticated)
2. Download endpoint (anonymous)
3. Login endpoint (brute force protection)
4. ALL endpoints
5. Stress test (100 requests)

---

### 2. **Python Script** (Advanced)
```bash
python3 test-rate-limit.py
```

**Features:**
- ✅ Sequential and concurrent testing
- ✅ Detailed statistics
- ✅ Response time analysis
- ✅ Thread-based concurrent requests
- ✅ JSON response parsing

**Tests Available:**
1. Quick test (70 sequential requests)
2. Burst test (50 concurrent requests)
3. Full test suite
4. Custom test

---

### 3. **Simple One-Liner** (Quick Test)
```bash
./test-rate-limit-simple.sh 70 "YOUR_JWT_TOKEN"
```

**Features:**
- ✅ Simple and fast
- ✅ No dependencies
- ✅ Easy to customize

---

## 🚀 Quick Start

### Option A: Interactive (Easiest)
```bash
cd /Users/QuinceNgomane/SecretProject/StatementFlex

# Update credentials in the script first
# nano test-rate-limit.sh
# Change: LOGIN_EMAIL and LOGIN_PASSWORD

./test-rate-limit.sh
```

### Option B: Python (Most Detailed)
```bash
# Install requests library if needed
pip3 install requests

# Update credentials
# nano test-rate-limit.py
# Change: LOGIN_EMAIL and LOGIN_PASSWORD

python3 test-rate-limit.py
```

### Option C: Manual curl (Quick & Dirty)
```bash
# 1. Get JWT token
TOKEN=$(curl -s -X POST http://localhost:5006/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"example@gmail.com","password":"YourPassword123!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Test rate limiting (send 70 requests)
for i in {1..70}; do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" \
    -H "Authorization: Bearer $TOKEN" \
    http://localhost:5006/api/StatementFlex/statement-list
  sleep 0.1
done
```

---

## 📊 Expected Results

### With Rate Limiting Enabled:
```
Request 1-60: ✓ 200 OK
Request 61-70: ✗ 429 TOO MANY REQUESTS
```

### Without Rate Limiting:
```
Request 1-70: ✓ 200 OK
(All requests succeed - rate limiting NOT working!)
```

---

## 🔧 Before Testing

### 1. Update Credentials
Edit the test script and update:
```bash
# In test-rate-limit.sh
LOGIN_EMAIL="example@gmail.com"
LOGIN_PASSWORD="YourPassword123!"

# Or in test-rate-limit.py
LOGIN_EMAIL = "example@gmail.com"
LOGIN_PASSWORD = "YourPassword123!"
```

### 2. Ensure API is Running
```bash
cd src/StatementFlex/StatementFlex.API
dotnet run
```

### 3. Verify Services are Running
```bash
docker-compose ps

# Should see:
# statementflex-postgres
# statementflex-minio
```

---

## 🧪 Test Scenarios

### Scenario 1: Test Statement List Rate Limiting
**Expected Limit:** 60 requests per minute
**Command:**
```bash
./test-rate-limit.sh
# Choose option 1
```

**What to look for:**
- Requests 1-60: Should succeed (200 OK)
- Requests 61+: Should fail (429 TOO MANY REQUESTS)

---

### Scenario 2: Test Login Brute Force Protection
**Expected Limit:** 5 attempts per 15 minutes
**Command:**
```bash
./test-rate-limit.sh
# Choose option 3
```

**What to look for:**
- Requests 1-5: Should process (401 UNAUTHORIZED - wrong password)
- Requests 6+: Should block (429 TOO MANY REQUESTS)

---

### Scenario 3: Test Concurrent Burst
**Tests:** 50 concurrent requests at once
**Command:**
```bash
python3 test-rate-limit.py
# Choose option 2
```

**What to look for:**
- Should handle concurrent load gracefully
- Rate limiting should still apply
- Some requests queued, some rate-limited

---

### Scenario 4: Test Download Rate Limiting
**Expected Limit:** 10 downloads per hour
**Steps:**
1. Get a statement list to get download token
2. Use token to test download endpoint

```bash
# 1. Get token
TOKEN=$(curl -s -X POST http://localhost:5006/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"example@gmail.com","password":"YourPassword123!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Get download link
DOWNLOAD_TOKEN=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:5006/api/StatementFlex/statement-list \
  | grep -o 'download/[^"]*' | head -1 | cut -d'/' -f2)

# 3. Test rate limiting
for i in {1..15}; do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" \
    "http://localhost:5006/api/StatementFlex/download/$DOWNLOAD_TOKEN"
  sleep 0.5
done
```

---

## 📈 Analyzing Results

### Success Indicators:
- ✅ First 60 requests succeed
- ✅ Subsequent requests return 429
- ✅ Rate limit headers present:
  ```
  X-RateLimit-Limit: 60
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1719234567
  Retry-After: 45
  ```

### Failure Indicators:
- ❌ All requests succeed (no 429)
- ❌ Random 429s (not after hitting limit)
- ❌ No rate limit headers
- ❌ 500 errors instead of 429

---

## 🐛 Troubleshooting

### Problem: All requests return 401 Unauthorized
**Solution:** Update credentials in test script or get fresh JWT token

### Problem: All requests succeed (no 429)
**Solution:** Rate limiting not configured or not enabled
- Check `app.UseRateLimiter()` is called in Program.cs
- Check rate limiter is configured in services
- Check `[EnableRateLimiting]` attribute is on endpoints

### Problem: Connection refused
**Solution:** API not running
```bash
cd src/StatementFlex/StatementFlex.API
dotnet run
```

### Problem: Script permission denied
**Solution:** Make script executable
```bash
chmod +x test-rate-limit.sh
chmod +x test-rate-limit-simple.sh
```

---

## 📝 Custom Testing

### Test Specific Endpoint
```bash
# Modify the endpoint in simple script
./test-rate-limit-simple.sh 100 "$TOKEN"
```

### Test with Different Timing
```python
# In Python script, change sleep value
time.sleep(0.05)  # 50ms between requests
time.sleep(2)     # 2 seconds between requests
```

### Monitor Rate Limit Headers
```bash
curl -v -H "Authorization: Bearer $TOKEN" \
  http://localhost:5006/api/StatementFlex/statement-list \
  2>&1 | grep -i "rate"
```

---

## 🎯 Production Testing

**DO NOT run these tests against production!**

If you must test production rate limits:
1. Use a dedicated test account
2. Run during off-hours
3. Use lower request counts
4. Monitor for impact on real users
5. Get approval from team first

---

## 📊 Sample Output

```
╔═══════════════════════════════════════════════════════════════╗
║       StatementFlex API Rate Limit Testing Script            ║
╔═══════════════════════════════════════════════════════════════╗

Getting JWT token...
✓ JWT token obtained

Testing: Statement List Endpoint
Endpoint: /api/StatementFlex/statement-list
Sending 70 requests...

Request   1: ✓ 200 OK
Request   2: ✓ 200 OK
...
Request  60: ✓ 200 OK
Request  61: ✗ 429 TOO MANY REQUESTS (Rate Limited!)
Request  62: ✗ 429 TOO MANY REQUESTS (Rate Limited!)
...
Request  70: ✗ 429 TOO MANY REQUESTS (Rate Limited!)

═══════════════════════════════════════════════════════════════
Successful requests: 60
Rate limited requests: 10
Other errors: 0
═══════════════════════════════════════════════════════════════

✓ Rate limiting is WORKING!
```

---

## 🚀 Next Steps

After testing:
1. ✅ Verify rate limits are appropriate for your use case
2. ✅ Adjust limits in Program.cs if needed
3. ✅ Monitor rate limit hits in production logs
4. ✅ Set up alerts for excessive rate limiting
5. ✅ Document rate limits in API documentation

---

**Created:** June 24, 2026  
**Scripts:** `test-rate-limit.sh`, `test-rate-limit.py`, `test-rate-limit-simple.sh`
