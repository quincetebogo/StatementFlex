#!/bin/bash

# Rate Limit Testing Script for StatementFlex API
# This script tests rate limiting on different endpoints

# Configuration
API_BASE_URL="http://localhost:5006"
JWT_TOKEN=""  # Add your JWT token here after logging in

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       StatementFlex API Rate Limit Testing Script            ║${NC}"
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Function to test rate limiting
test_rate_limit() {
    local endpoint=$1
    local num_requests=$2
    local description=$3
    local use_auth=$4

    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo -e "${YELLOW}Endpoint: ${endpoint}${NC}"
    echo -e "${YELLOW}Sending ${num_requests} requests...${NC}"
    echo ""

    local success_count=0
    local rate_limited_count=0
    local error_count=0

    for i in $(seq 1 $num_requests); do
        if [ "$use_auth" = true ]; then
            response=$(curl -s -w "\n%{http_code}" \
                -H "Authorization: Bearer ${JWT_TOKEN}" \
                "${API_BASE_URL}${endpoint}")
        else
            response=$(curl -s -w "\n%{http_code}" \
                "${API_BASE_URL}${endpoint}")
        fi

        http_code=$(echo "$response" | tail -1)

        if [ "$http_code" = "200" ]; then
            echo -e "${GREEN}Request $i: ✓ 200 OK${NC}"
            ((success_count++))
        elif [ "$http_code" = "429" ]; then
            echo -e "${RED}Request $i: ✗ 429 TOO MANY REQUESTS (Rate Limited!)${NC}"
            ((rate_limited_count++))
        else
            echo -e "${YELLOW}Request $i: ⚠ ${http_code}${NC}"
            ((error_count++))
        fi

        # Small delay to see results clearly
        sleep 0.1
    done

    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Successful requests: ${success_count}${NC}"
    echo -e "${RED}Rate limited requests: ${rate_limited_count}${NC}"
    echo -e "${YELLOW}Other errors: ${error_count}${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to get JWT token
get_jwt_token() {
    echo -e "${YELLOW}Getting JWT token...${NC}"

    login_response=$(curl -s -X POST "${API_BASE_URL}/api/Auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "example@gmail.com",
            "password": "example!"
        }')

    JWT_TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

    if [ -z "$JWT_TOKEN" ]; then
        echo -e "${RED}Failed to get JWT token. Please check credentials.${NC}"
        echo "Response: $login_response"
        exit 1
    fi

    echo -e "${GREEN}✓ JWT token obtained${NC}"
    echo "Token: ${JWT_TOKEN:0:20}..."
    echo ""
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}Select a test:${NC}"
    echo "1. Test Statement List endpoint (authenticated)"
    echo "2. Test Download endpoint (anonymous)"
    echo "3. Test Login endpoint (brute force protection)"
    echo "4. Test ALL endpoints"
    echo "5. Stress test (100 requests)"
    echo "6. Exit"
    echo ""
    read -p "Enter choice [1-6]: " choice

    case $choice in
        1)
            get_jwt_token
            test_rate_limit "/api/StatementFlex/statement-list" 70 "Statement List Endpoint" true
            show_menu
            ;;
        2)
            echo -e "${YELLOW}Note: You need a valid download token for this test${NC}"
            read -p "Enter download token: " download_token
            test_rate_limit "/api/StatementFlex/download/${download_token}" 15 "Download Endpoint" false
            show_menu
            ;;
        3)
            test_login_rate_limit
            show_menu
            ;;
        4)
            echo -e "${BLUE}Running all tests...${NC}"
            get_jwt_token
            test_rate_limit "/api/StatementFlex/statement-list" 70 "Statement List Endpoint" true
            sleep 2
            test_login_rate_limit
            show_menu
            ;;
        5)
            get_jwt_token
            test_rate_limit "/api/StatementFlex/statement-list" 100 "Stress Test - Statement List" true
            show_menu
            ;;
        6)
            echo -e "${GREEN}Exiting...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            show_menu
            ;;
    esac
}

# Test login rate limiting
test_login_rate_limit() {
    echo -e "${YELLOW}Testing: Login Rate Limiting${NC}"
    echo -e "${YELLOW}Sending 10 login attempts...${NC}"
    echo ""

    local success_count=0
    local rate_limited_count=0

    for i in $(seq 1 10); do
        response=$(curl -s -w "\n%{http_code}" -X POST \
            "${API_BASE_URL}/api/Auth/login" \
            -H "Content-Type: application/json" \
            -d '{
                "email": "test@example.com",
                "password": "wrongpassword"
            }')

        http_code=$(echo "$response" | tail -1)

        if [ "$http_code" = "200" ] || [ "$http_code" = "401" ]; then
            echo -e "${GREEN}Request $i: ✓ ${http_code} (Processed)${NC}"
            ((success_count++))
        elif [ "$http_code" = "429" ]; then
            echo -e "${RED}Request $i: ✗ 429 TOO MANY REQUESTS${NC}"
            ((rate_limited_count++))
        fi

        sleep 0.2
    done

    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Processed requests: ${success_count}${NC}"
    echo -e "${RED}Rate limited requests: ${rate_limited_count}${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Start the menu
show_menu
