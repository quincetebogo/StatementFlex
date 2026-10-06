#!/usr/bin/env python3
"""
Rate Limit Testing Script for StatementFlex API
Tests rate limiting with concurrent requests and detailed reporting
"""

import requests
import time
import threading
from datetime import datetime
from collections import defaultdict
import json

# Configuration
API_BASE_URL = "http://localhost:5006"
LOGIN_EMAIL = "example@gmail.com"
LOGIN_PASSWORD = "YourPassword123!"

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

class RateLimitTester:
    def __init__(self):
        self.jwt_token = None
        self.results = defaultdict(list)

    def get_jwt_token(self):
        """Get JWT token by logging in"""
        print(f"{Colors.YELLOW}Getting JWT token...{Colors.ENDC}")

        response = requests.post(
            f"{API_BASE_URL}/api/Auth/login",
            json={
                "email": LOGIN_EMAIL,
                "password": LOGIN_PASSWORD
            }
        )

        if response.status_code == 200:
            data = response.json()
            self.jwt_token = data.get('token')
            print(f"{Colors.GREEN}✓ JWT token obtained{Colors.ENDC}")
            print(f"Token: {self.jwt_token[:20]}...\n")
            return True
        else:
            print(f"{Colors.RED}Failed to get JWT token: {response.status_code}{Colors.ENDC}")
            print(f"Response: {response.text}")
            return False

    def make_request(self, endpoint, method="GET", headers=None, json_data=None, request_id=None):
        """Make a single request and return the result"""
        url = f"{API_BASE_URL}{endpoint}"

        try:
            start_time = time.time()

            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=json_data, timeout=10)

            elapsed = time.time() - start_time

            return {
                'request_id': request_id,
                'status_code': response.status_code,
                'elapsed': elapsed,
                'timestamp': datetime.now().isoformat(),
                'headers': dict(response.headers)
            }
        except Exception as e:
            return {
                'request_id': request_id,
                'status_code': 0,
                'error': str(e),
                'elapsed': 0,
                'timestamp': datetime.now().isoformat()
            }

    def test_endpoint(self, endpoint, num_requests, description, use_auth=True, concurrent=False):
        """Test rate limiting on an endpoint"""
        print(f"\n{Colors.BLUE}{'═' * 70}{Colors.ENDC}")
        print(f"{Colors.CYAN}Testing: {description}{Colors.ENDC}")
        print(f"{Colors.CYAN}Endpoint: {endpoint}{Colors.ENDC}")
        print(f"{Colors.CYAN}Mode: {'Concurrent' if concurrent else 'Sequential'}{Colors.ENDC}")
        print(f"{Colors.CYAN}Sending {num_requests} requests...{Colors.ENDC}\n")

        headers = {}
        if use_auth and self.jwt_token:
            headers['Authorization'] = f'Bearer {self.jwt_token}'

        results = []

        if concurrent:
            # Concurrent requests using threads
            threads = []
            for i in range(num_requests):
                thread = threading.Thread(
                    target=lambda idx=i: results.append(
                        self.make_request(endpoint, headers=headers, request_id=idx+1)
                    )
                )
                threads.append(thread)
                thread.start()

            # Wait for all threads to complete
            for thread in threads:
                thread.join()
        else:
            # Sequential requests
            for i in range(num_requests):
                result = self.make_request(endpoint, headers=headers, request_id=i+1)
                results.append(result)

                # Print status
                status_code = result['status_code']
                if status_code == 200:
                    print(f"{Colors.GREEN}Request {i+1:3d}: ✓ 200 OK ({result['elapsed']:.3f}s){Colors.ENDC}")
                elif status_code == 429:
                    print(f"{Colors.RED}Request {i+1:3d}: ✗ 429 TOO MANY REQUESTS{Colors.ENDC}")
                elif status_code == 401:
                    print(f"{Colors.YELLOW}Request {i+1:3d}: ⚠ 401 UNAUTHORIZED{Colors.ENDC}")
                else:
                    print(f"{Colors.YELLOW}Request {i+1:3d}: ⚠ {status_code}{Colors.ENDC}")

                time.sleep(0.05)  # Small delay for readability

        # Analyze results
        self.print_results(results)

        return results

    def print_results(self, results):
        """Print summary of test results"""
        status_counts = defaultdict(int)
        total_time = 0

        for result in results:
            status_counts[result['status_code']] += 1
            total_time += result.get('elapsed', 0)

        print(f"\n{Colors.BLUE}{'═' * 70}{Colors.ENDC}")
        print(f"{Colors.BOLD}Results Summary:{Colors.ENDC}\n")

        for status_code in sorted(status_counts.keys()):
            count = status_counts[status_code]
            if status_code == 200:
                print(f"{Colors.GREEN}  ✓ 200 OK: {count} requests{Colors.ENDC}")
            elif status_code == 429:
                print(f"{Colors.RED}  ✗ 429 TOO MANY REQUESTS: {count} requests (Rate Limited!){Colors.ENDC}")
            elif status_code == 401:
                print(f"{Colors.YELLOW}  ⚠ 401 UNAUTHORIZED: {count} requests{Colors.ENDC}")
            elif status_code == 0:
                print(f"{Colors.RED}  ✗ NETWORK ERROR: {count} requests{Colors.ENDC}")
            else:
                print(f"{Colors.YELLOW}  ⚠ {status_code}: {count} requests{Colors.ENDC}")

        if total_time > 0:
            avg_time = total_time / len(results)
            print(f"\n{Colors.CYAN}  Average response time: {avg_time:.3f}s{Colors.ENDC}")
            print(f"{Colors.CYAN}  Total time: {total_time:.3f}s{Colors.ENDC}")

        print(f"{Colors.BLUE}{'═' * 70}{Colors.ENDC}\n")

        # Check if rate limiting is working
        if status_counts.get(429, 0) > 0:
            print(f"{Colors.GREEN}✓ Rate limiting is WORKING!{Colors.ENDC}\n")
        else:
            print(f"{Colors.RED}⚠ No rate limiting detected - sent {len(results)} requests without hitting limit{Colors.ENDC}\n")

    def run_all_tests(self):
        """Run all rate limiting tests"""
        print(f"{Colors.BLUE}{'═' * 70}{Colors.ENDC}")
        print(f"{Colors.BOLD}  StatementFlex API Rate Limit Testing Suite{Colors.ENDC}")
        print(f"{Colors.BLUE}{'═' * 70}{Colors.ENDC}\n")

        # Get JWT token
        if not self.get_jwt_token():
            return

        # Test 1: Statement List (Sequential)
        self.test_endpoint(
            "/api/StatementFlex/statement-list",
            70,
            "Statement List - Sequential Requests",
            use_auth=True,
            concurrent=False
        )

        time.sleep(2)

        # Test 2: Statement List (Concurrent)
        self.test_endpoint(
            "/api/StatementFlex/statement-list",
            50,
            "Statement List - Concurrent Burst",
            use_auth=True,
            concurrent=True
        )

        print(f"\n{Colors.GREEN}All tests completed!{Colors.ENDC}")

def main():
    tester = RateLimitTester()

    print("""
    StatementFlex Rate Limit Testing Tool

    Options:
    1. Quick test (70 requests, sequential)
    2. Burst test (50 requests, concurrent)
    3. Full test suite
    4. Custom test

    """)

    choice = input("Select option [1-4]: ").strip()

    if choice == "1":
        if tester.get_jwt_token():
            tester.test_endpoint(
                "/api/StatementFlex/statement-list",
                70,
                "Quick Sequential Test",
                use_auth=True,
                concurrent=False
            )
    elif choice == "2":
        if tester.get_jwt_token():
            tester.test_endpoint(
                "/api/StatementFlex/statement-list",
                50,
                "Burst Test",
                use_auth=True,
                concurrent=True
            )
    elif choice == "3":
        tester.run_all_tests()
    elif choice == "4":
        num = int(input("Number of requests: "))
        concurrent = input("Concurrent? (y/n): ").lower() == 'y'
        if tester.get_jwt_token():
            tester.test_endpoint(
                "/api/StatementFlex/statement-list",
                num,
                "Custom Test",
                use_auth=True,
                concurrent=concurrent
            )
    else:
        print("Invalid choice")

if __name__ == "__main__":
    main()
