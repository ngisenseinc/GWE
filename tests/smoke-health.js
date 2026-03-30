#!/usr/bin/env node
"use strict";
const API_BASE_URL = process.env.API_BASE_URL;
const TEST_EMAIL = process.env.SMOKE_TEST_EMAIL || `smoke-health-${Date.now()}@example.com`;
const TEST_PASSWORD = process.env.SMOKE_TEST_PASS || 'Sm3keP@ssw0rd';

async function post(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
}

async function get(url, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'GET', headers });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
}

async function run() {
  if (!API_BASE_URL) {
    console.log('SMOKE-HEALTH: API_BASE_URL not set, skipping health tests.');
    process.exit(0);
  }
  console.log('SMOKE-HEALTH: Starting health tests against', API_BASE_URL);
  try {
    // Register
    const reg = await post(`${API_BASE_URL}/api/auth/register`, { email: TEST_EMAIL, password: TEST_PASSWORD, name: 'Smoke Health' });
    // Login
    const login = await post(`${API_BASE_URL}/api/auth/login`, { email: TEST_EMAIL, password: TEST_PASSWORD });
    const token = login.json?.accessToken || login.json?.token;
    // Health
    const health = await get(`${API_BASE_URL}/api/health`, token);
    // Protected Health
    const healthAuth = await get(`${API_BASE_URL}/api/health/auth`, token);
    // Logout
    const logout = await post(`${API_BASE_URL}/api/auth/logout`, { refreshToken: login.json?.refreshToken }, token);
    console.log('SMOKE-HEALTH: health', health.status, health.json, 'health-auth', healthAuth.status);
    process.exit(0);
  } catch (err) {
    console.error('SMOKE-HEALTH: Unexpected error', err);
    process.exit(1);
  }
}
run();
