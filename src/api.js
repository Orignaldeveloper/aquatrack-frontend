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
// ─── DELIVERY PERSONS ─────────────────────────────────────────────────────────
export const getDeliveryPersonsAPI = async () => {
  const res = await fetch(`${BASE_URL}/auth/delivery-persons`, {
    headers: headers()
  })
  return res.json()
}

export const addDeliveryPersonAPI = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/add-user`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ ...data, role: 'delivery' })
  })
  return res.json()
}

export const updateDeliveryPersonAPI = async (id, data) => {
  const res = await fetch(`${BASE_URL}/auth/delivery-persons/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export const deleteDeliveryPersonAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/auth/delivery-persons/${id}`, {
    method: 'DELETE',
    headers: headers()
  })
  return res.json()
}
// ─── TENANTS ──────────────────────────────────────────────────────────────────
export const getTenantsAPI = async () => {
  const res = await fetch(`${BASE_URL}/auth/tenants`, { headers: headers() })
  return res.json()
}

export const createTenantAPI = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/register-tenant`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export const toggleTenantAPI = async (id, active) => {
  const res = await fetch(`${BASE_URL}/auth/tenants/${id}/toggle`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ active })
  })
  return res.json()
}
export const updateDeliveryAPI = async (id, data) => {
  const res = await fetch(`${BASE_URL}/deliveries/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data)
  })
  return res.json()
}