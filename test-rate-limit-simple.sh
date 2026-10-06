#!/bin/bash
# Simple one-liner rate limit test

# Usage: ./test-rate-limit-simple.sh [number_of_requests] [jwt_token]

NUM_REQUESTS=${1:-70}
JWT_TOKEN=${2:-""}
API_URL="http://localhost:5006/api/StatementFlex/statement-list"

echo "Sending $NUM_REQUESTS requests to test rate limiting..."
echo ""

for i in $(seq 1 $NUM_REQUESTS); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        "$API_URL")

    if [ "$HTTP_CODE" == "200" ]; then
        echo "Request $i: ✓ $HTTP_CODE"
    elif [ "$HTTP_CODE" == "429" ]; then
        echo "Request $i: ✗ $HTTP_CODE (RATE LIMITED!)"
    else
        echo "Request $i: ⚠ $HTTP_CODE"
    fi
done

echo ""
echo "Test complete!"
