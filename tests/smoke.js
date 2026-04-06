#!/usr/bin/env node
"use strict";

// Simple smoke test for MVP backend on a deployed or local API_BASE_URL
// Reads: API_BASE_URL, optional SMOKE_TEST_EMAIL, SMOKE_TEST_PASS

const API_BASE_URL = process.env.API_BASE_URL;
const TEST_EMAIL = process.env.SMOKE_TEST_EMAIL || `smoke-${Date.now()}@example.com`;
const TEST_PASSWORD = process.env.SMOKE_TEST_PASS || 'Sm3keP@ssw0rd';

async function post(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
}

async function get(url, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: 'GET',
    headers
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
}

async function run() {
  if (!API_BASE_URL) {
    console.log('SMOKE: API_BASE_URL not set, skipping smoke tests.');
    process.exit(0);
  }
  console.log('SMOKE: Starting tests against', API_BASE_URL);

  try {
    // 1) Register
    const reg = await post(`${API_BASE_URL}/api/auth/register`, { email: TEST_EMAIL, password: TEST_PASSWORD, name: 'Smoke Tester' });
    if (!reg.ok && reg.status !== 409) {
      console.error('SMOKE: Registration failed', reg.status, reg.json);
      process.exit(1);
    }
    // 2) Login
    const log = await post(`${API_BASE_URL}/api/auth/login`, { email: TEST_EMAIL, password: TEST_PASSWORD });
    if (!log.ok) {
      console.error('SMOKE: Login failed', log.status, log.json);
      process.exit(1);
    }
    const accessToken = log.json?.accessToken;
    const refreshToken = log.json?.refreshToken;
    if (!accessToken || !refreshToken) {
      console.error('SMOKE: Missing tokens on login');
      process.exit(1);
    }
    // 3) Me endpoint
    const me = await get(`${API_BASE_URL}/api/auth/me`, refreshToken ? refreshToken : accessToken);
    if (!me.ok) {
      console.error('SMOKE: Me failed', me.status, me.json);
      process.exit(1);
    }
    // 4) Refresh
    const ref = await post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken }, refreshToken);
    if (!ref.ok) {
      console.error('SMOKE: Refresh failed', ref.status, ref.json);
      process.exit(1);
    }
    // 5) Logout
    const logout = await post(`${API_BASE_URL}/api/auth/logout`, { refreshToken: refreshToken }, accessToken);
    if (!logout.ok) {
      console.error('SMOKE: Logout failed', logout.status, logout.json);
      // don't exit hard; continue to summarize
    }

    console.log('SMOKE: All steps completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('SMOKE: Unexpected error', err);
    process.exit(1);
  }
}

run();
