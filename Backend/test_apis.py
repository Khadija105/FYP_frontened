#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive API Testing Script for Art Marketplace Backend
Tests all endpoints with proper request/response validation
"""

import json
import requests
import time
from datetime import datetime
from typing import Optional, Dict, Any
import sys

# Fix encoding on Windows
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Configuration
BASE_URL = "http://localhost:8000"
TIMEOUT = 10

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

class APITester:
    def __init__(self):
        self.token = None
        self.user_id = None
        self.artwork_id = None
        self.artist_id = None
        self.comment_id = None
        self.test_email = f"testuser_{int(time.time())}@example.com"
        self.passed = 0
        self.failed = 0
        self.session = requests.Session()

    def print_header(self, text: str):
        """Print section header"""
        print(f"\n{Colors.BLUE}{'='*60}")
        print(f"  {text}")
        print(f"{'='*60}{Colors.RESET}\n")

    def print_test(self, test_name: str, method: str, endpoint: str):
        """Print test being executed"""
        print(f"{Colors.YELLOW}Testing: {method} {endpoint}{Colors.RESET}")
        print(f"  {test_name}")

    def print_pass(self, message: str = "PASS"):
        """Print passing test"""
        self.passed += 1
        print(f"  {Colors.GREEN}[PASS] {message}{Colors.RESET}")

    def print_fail(self, message: str, error: str = ""):
        """Print failing test"""
        self.failed += 1
        print(f"  {Colors.RED}[FAIL] {message}{Colors.RESET}")
        if error:
            print(f"    Error: {error}")

    def request(self, method: str, endpoint: str, **kwargs) -> Optional[Dict]:
        """Make HTTP request and return JSON response"""
        url = f"{BASE_URL}{endpoint}"
        headers = kwargs.pop("headers", {})

        if self.token and "Authorization" not in headers:
            headers["Authorization"] = f"Bearer {self.token}"

        try:
            response = self.session.request(
                method, url, headers=headers, timeout=TIMEOUT, **kwargs
            )

            # Print request/response for debugging
            print(f"    Status: {response.status_code}")

            try:
                data = response.json()
                return response.status_code, data
            except:
                return response.status_code, response.text

        except requests.exceptions.ConnectionError:
            self.print_fail(f"Connection Error - Is backend running on {BASE_URL}?")
            return None, None
        except Exception as e:
            self.print_fail(f"Request Error", str(e))
            return None, None

    def test_health(self):
        """Test health endpoints"""
        self.print_header("HEALTH ENDPOINTS")

        # Root endpoint
        self.print_test("API Root", "GET", "/")
        status, data = self.request("GET", "/")
        if status == 200 and data.get("status") == "ok":
            self.print_pass(f"Root OK - Version {data.get('version')}")
        else:
            self.print_fail("Root endpoint", str(status))

        # Health endpoint
        self.print_test("Health Check", "GET", "/health")
        status, data = self.request("GET", "/health")
        if status == 200 and data.get("status") == "ok":
            stats = data.get("stats", {})
            self.print_pass(f"Health OK - Users: {stats.get('users')}, Artworks: {stats.get('artworks')}")
        else:
            self.print_fail("Health endpoint", str(status))

    def test_auth(self):
        """Test authentication endpoints"""
        self.print_header("AUTH ENDPOINTS")

        # Register
        self.print_test("User Registration", "POST", "/api/auth/register")
        payload = {
            "name": f"Test User {int(time.time())}",
            "email": self.test_email,
            "password": "Test@123456"
        }
        status, data = self.request("POST", "/api/auth/register", json=payload)
        if status == 201 and "token" in data:
            self.token = data["token"]
            self.user_id = data["user"]["id"]
            self.print_pass(f"User registered: {self.user_id}")
        else:
            self.print_fail("Registration failed", f"Status: {status}")
            return

        # Login
        self.print_test("User Login", "POST", "/api/auth/login")
        payload = {"email": self.test_email, "password": "Test@123456"}
        status, data = self.request("POST", "/api/auth/login", json=payload, headers={})
        if status == 200 and "token" in data:
            self.print_pass(f"Login successful")
        else:
            self.print_fail("Login failed", str(status))

        # Get current user
        self.print_test("Get Current User", "GET", "/api/auth/me")
        status, data = self.request("GET", "/api/auth/me")
        if status == 200 and data.get("id") == self.user_id:
            self.print_pass(f"Current user: {data.get('name')}")
        else:
            self.print_fail("Get current user failed", str(status))

    def test_artists(self):
        """Test artist endpoints"""
        self.print_header("ARTIST ENDPOINTS")

        # List artists
        self.print_test("List Artists", "GET", "/api/artists")
        status, data = self.request("GET", "/api/artists")
        if status == 200 and isinstance(data, list) and len(data) > 0:
            self.artist_id = data[0]["id"]
            self.print_pass(f"Listed {len(data)} artists")
        else:
            self.print_fail("List artists failed", str(status))
            return

        # Trending artists
        self.print_test("Trending Artists", "GET", "/api/artists/trending")
        status, data = self.request("GET", "/api/artists/trending")
        if status == 200 and isinstance(data, list):
            self.print_pass(f"Got {len(data)} trending artists")
        else:
            self.print_fail("Trending artists failed", str(status))

        # Get artist by ID
        self.print_test("Get Artist", "GET", f"/api/artists/{self.artist_id}")
        status, data = self.request("GET", f"/api/artists/{self.artist_id}")
        if status == 200:
            self.print_pass(f"Got artist: {data.get('name')}")
        else:
            self.print_fail("Get artist failed", str(status))

        # Get artist artworks
        self.print_test("Get Artist Artworks", "GET", f"/api/artists/{self.artist_id}/artworks")
        status, data = self.request("GET", f"/api/artists/{self.artist_id}/artworks")
        if status == 200 and isinstance(data, list):
            self.print_pass(f"Got {len(data)} artworks from artist")
        else:
            self.print_fail("Get artist artworks failed", str(status))

        # Follow artist
        self.print_test("Follow Artist", "POST", f"/api/artists/{self.artist_id}/follow")
        status, data = self.request("POST", f"/api/artists/{self.artist_id}/follow")
        if status == 200:
            self.print_pass(f"Followed artist")
        else:
            self.print_fail("Follow artist failed", str(status))

        # Unfollow artist
        self.print_test("Unfollow Artist", "POST", f"/api/artists/{self.artist_id}/unfollow")
        status, data = self.request("POST", f"/api/artists/{self.artist_id}/unfollow")
        if status == 200:
            self.print_pass(f"Unfollowed artist")
        else:
            self.print_fail("Unfollow artist failed", str(status))

    def test_artworks(self):
        """Test artwork endpoints"""
        self.print_header("ARTWORK ENDPOINTS")

        # List artworks
        self.print_test("List Artworks", "GET", "/api/artworks")
        status, data = self.request("GET", "/api/artworks")
        if status == 200 and isinstance(data, list) and len(data) > 0:
            self.artwork_id = data[0]["id"]
            self.print_pass(f"Listed {len(data)} artworks")
        else:
            self.print_fail("List artworks failed", str(status))
            return

        # Featured artworks
        self.print_test("Featured Artworks", "GET", "/api/artworks/featured")
        status, data = self.request("GET", "/api/artworks/featured")
        if status == 200 and isinstance(data, list):
            self.print_pass(f"Got {len(data)} featured artworks")
        else:
            self.print_fail("Featured artworks failed", str(status))

        # Trending artworks
        self.print_test("Trending Artworks", "GET", "/api/artworks/trending")
        status, data = self.request("GET", "/api/artworks/trending")
        if status == 200 and isinstance(data, list):
            self.print_pass(f"Got {len(data)} trending artworks")
        else:
            self.print_fail("Trending artworks failed", str(status))

        # Search artworks
        self.print_test("Search Artworks", "GET", "/api/artworks/search?q=art")
        status, data = self.request("GET", "/api/artworks/search?q=art")
        if status == 200 and isinstance(data, list):
            self.print_pass(f"Found {len(data)} artworks matching 'art'")
        else:
            self.print_fail("Search artworks failed", str(status))

        # Get artwork by ID
        self.print_test("Get Artwork", "GET", f"/api/artworks/{self.artwork_id}")
        status, data = self.request("GET", f"/api/artworks/{self.artwork_id}")
        if status == 200:
            self.print_pass(f"Got artwork: {data.get('title')}")
        else:
            self.print_fail("Get artwork failed", str(status))

        # Like artwork
        self.print_test("Like Artwork", "POST", f"/api/artworks/{self.artwork_id}/like")
        status, data = self.request("POST", f"/api/artworks/{self.artwork_id}/like")
        if status == 200:
            self.print_pass(f"Liked artwork - Total likes: {data.get('likes')}")
        else:
            self.print_fail("Like artwork failed", str(status))

        # List comments
        self.print_test("List Comments", "GET", f"/api/artworks/{self.artwork_id}/comments")
        status, data = self.request("GET", f"/api/artworks/{self.artwork_id}/comments")
        if status == 200 and isinstance(data, list):
            self.print_pass(f"Got {len(data)} comments")
            if len(data) > 0:
                self.comment_id = data[0]["id"]
        else:
            self.print_fail("List comments failed", str(status))

        # Add comment
        self.print_test("Add Comment", "POST", f"/api/artworks/{self.artwork_id}/comments")
        payload = {"text": f"Test comment at {datetime.now()}"}
        status, data = self.request("POST", f"/api/artworks/{self.artwork_id}/comments", json=payload)
        if status == 201:
            self.comment_id = data.get("id")
            self.print_pass(f"Added comment: {self.comment_id}")
        else:
            self.print_fail("Add comment failed", str(status))

    def test_users(self):
        """Test user endpoints"""
        self.print_header("USER ENDPOINTS")

        # Get profile
        self.print_test("Get My Profile", "GET", "/api/users/me/profile")
        status, data = self.request("GET", "/api/users/me/profile")
        if status == 200:
            self.print_pass(f"Got profile: {data.get('name')}")
        else:
            self.print_fail("Get profile failed", str(status))

        # Update profile
        self.print_test("Update Profile", "PATCH", "/api/users/me/profile")
        payload = {"bio": "Updated bio from test", "location": "Test City"}
        status, data = self.request("PATCH", "/api/users/me/profile", json=payload)
        if status == 200:
            self.print_pass(f"Updated profile")
        else:
            self.print_fail("Update profile failed", str(status))

        # Get settings
        self.print_test("Get Settings", "GET", "/api/users/me/settings")
        status, data = self.request("GET", "/api/users/me/settings")
        if status == 200:
            self.print_pass(f"Got settings")
        else:
            self.print_fail("Get settings failed", str(status))

        # Update settings
        self.print_test("Update Settings", "PUT", "/api/users/me/settings")
        payload = {"theme": "dark", "emailNotifications": False}
        status, data = self.request("PUT", "/api/users/me/settings", json=payload)
        if status == 200:
            self.print_pass(f"Updated settings")
        else:
            self.print_fail("Update settings failed", str(status))

        # Get notifications
        self.print_test("Get Notifications", "GET", "/api/users/me/notifications")
        status, data = self.request("GET", "/api/users/me/notifications")
        if status == 200 and isinstance(data, list):
            self.print_pass(f"Got {len(data)} notifications")
        else:
            self.print_fail("Get notifications failed", str(status))

        # Get favorites
        self.print_test("Get Favorites", "GET", "/api/users/me/favorites")
        status, data = self.request("GET", "/api/users/me/favorites")
        if status == 200 and isinstance(data, list):
            self.print_pass(f"Got {len(data)} favorite artworks")
        else:
            self.print_fail("Get favorites failed", str(status))

        # Get activity
        self.print_test("Get Activity", "GET", "/api/users/me/activity")
        status, data = self.request("GET", "/api/users/me/activity")
        if status == 200 and isinstance(data, list):
            self.print_pass(f"Got {len(data)} activity items")
        else:
            self.print_fail("Get activity failed", str(status))

        # Become artist
        self.print_test("Become Artist", "POST", "/api/users/me/become-artist")
        status, data = self.request("POST", "/api/users/me/become-artist")
        if status == 200:
            self.print_pass(f"Upgraded to artist role")
        else:
            self.print_fail("Become artist failed", str(status))

    def test_change_password(self):
        """Test password change"""
        self.print_header("PASSWORD CHANGE")

        self.print_test("Change Password", "POST", "/api/auth/change-password")
        payload = {
            "currentPassword": "Test@123456",
            "newPassword": "NewTest@123456"
        }
        status, data = self.request("POST", "/api/auth/change-password", json=payload)
        if status == 200:
            self.print_pass("Password changed successfully")
        else:
            self.print_fail("Change password failed", str(status))

    def test_logout(self):
        """Test logout"""
        self.print_header("LOGOUT")

        self.print_test("Logout", "POST", "/api/auth/logout")
        status, data = self.request("POST", "/api/auth/logout")
        if status == 200:
            self.token = None
            self.print_pass("Logged out successfully")
        else:
            self.print_fail("Logout failed", str(status))

    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"\n{Colors.BLUE}")
        print("=" * 60)
        print("  COMPREHENSIVE API TEST SUITE".center(60))
        print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}".center(60))
        print("=" * 60)
        print(Colors.RESET)

        self.test_health()
        self.test_auth()
        self.test_artists()
        self.test_artworks()
        self.test_users()
        self.test_change_password()
        self.test_logout()

        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        self.print_header("TEST SUMMARY")
        total = self.passed + self.failed
        percentage = (self.passed / total * 100) if total > 0 else 0

        print(f"{Colors.GREEN}[PASSED] Passed: {self.passed}{Colors.RESET}")
        print(f"{Colors.RED}[FAILED] Failed: {self.failed}{Colors.RESET}")
        print(f"  Total:  {total}")
        print(f"  Success Rate: {percentage:.1f}%\n")

        if self.failed == 0:
            print(f"{Colors.GREEN}[SUCCESS] ALL TESTS PASSED!{Colors.RESET}\n")
        else:
            print(f"{Colors.RED}[WARNING] Some tests failed. Please review above.{Colors.RESET}\n")

if __name__ == "__main__":
    tester = APITester()
    tester.run_all_tests()
