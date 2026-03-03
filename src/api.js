const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api'

const getToken = () => localStorage.getItem('token')

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
})

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const loginAPI = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────
export const getCustomersAPI = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE_URL}/customers?${query}`, { headers: headers() })
  return res.json()
}

export const createCustomerAPI = async (data) => {
  const res = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export const updateCustomerAPI = async (id, data) => {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export const deleteCustomerAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: 'DELETE',
    headers: headers()
  })
  return res.json()
}

// ─── DELIVERIES ───────────────────────────────────────────────────────────────
export const getTodaySummaryAPI = async () => {
  const res = await fetch(`${BASE_URL}/deliveries/today-summary`, {
    headers: headers()
  })
  return res.json()
}

export const getDeliveriesAPI = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE_URL}/deliveries?${query}`, {
    headers: headers()
  })
  return res.json()
}

export const createDeliveryAPI = async (data) => {
  const res = await fetch(`${BASE_URL}/deliveries`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export const deleteDeliveryAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/deliveries/${id}`, {
    method: 'DELETE',
    headers: headers()
  })
  return res.json()
}

// ─── BILLING ──────────────────────────────────────────────────────────────────
export const getInvoicesAPI = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE_URL}/billing?${query}`, {
    headers: headers()
  })
  return res.json()
}

export const generateBillingAPI = async (month, year) => {
  const res = await fetch(`${BASE_URL}/billing/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ month, year })
  })
  return res.json()
}

export const markAsPaidAPI = async (id, paidAmount) => {
  const res = await fetch(`${BASE_URL}/billing/${id}/pay`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ paidAmount })
  })
  return res.json()
}

export const getBillingSummaryAPI = async () => {
  const res = await fetch(`${BASE_URL}/billing/summary`, {
    headers: headers()
  })
  return res.json()
}
