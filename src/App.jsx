import React, { useState, useEffect } from "react";
import {
  loginAPI,
  getCustomersAPI, createCustomerAPI, updateCustomerAPI, deleteCustomerAPI,
  getTodaySummaryAPI, getDeliveriesAPI, createDeliveryAPI, deleteDeliveryAPI, updateDeliveryAPI,
  getInvoicesAPI, generateBillingAPI, markAsPaidAPI,
  getDeliveryPersonsAPI, addDeliveryPersonAPI, updateDeliveryPersonAPI, deleteDeliveryPersonAPI,
  getTenantsAPI, createTenantAPI, toggleTenantAPI, updateTenantAPI
} from './api.js';
// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: "u1", name: "Rajesh Kumar", email: "admin@aquatrack.com", password: "admin123", role: "admin", tenantId: "t1", avatar: "RK" },
  { id: "u2", name: "Suresh Delivery", email: "delivery@aquatrack.com", password: "del123", role: "delivery", tenantId: "t1", avatar: "SD" },
  { id: "su", name: "Super Admin", email: "super@aquatrack.com", password: "super123", role: "superadmin", tenantId: null, avatar: "SA" },
];

const TENANTS = [
  { id: "t1", name: "AquaPure Distributors", plan: "pro", active: true, customers: 48, revenue: 124500 },
  { id: "t2", name: "ClearWater Solutions", plan: "basic", active: true, customers: 22, revenue: 56000 },
  { id: "t3", name: "HydroFlow Delhi", plan: "pro", active: false, customers: 31, revenue: 89200 },
];

const CUSTOMERS = [
  { id: "c1", name: "Amit Sharma", mobile: "9876543210", address: "12 MG Road", area: "Koramangala", rate: 30, deposit: 500, active: true, balance: 240, cansOut: 3 },
  { id: "c2", name: "Priya Singh", mobile: "9876543211", address: "45 HSR Layout", area: "HSR Layout", rate: 35, deposit: 700, active: true, balance: 0, cansOut: 2 },
  { id: "c3", name: "Vikas Patel", mobile: "9876543212", address: "7 Indiranagar", area: "Indiranagar", rate: 30, deposit: 500, active: true, balance: 120, cansOut: 5 },
  { id: "c4", name: "Sunita Joshi", mobile: "9876543213", address: "23 BTM Layout", area: "BTM Layout", rate: 25, deposit: 500, active: true, balance: 0, cansOut: 1 },
  { id: "c5", name: "Ravi Nair", mobile: "9876543214", address: "89 Jayanagar", area: "Jayanagar", rate: 30, deposit: 500, active: false, balance: 360, cansOut: 0 },
  { id: "c6", name: "Kavitha Reddy", mobile: "9876543215", address: "34 Whitefield", area: "Whitefield", rate: 40, deposit: 1000, active: true, balance: 80, cansOut: 4 },
];

const DELIVERIES_TODAY = [
  { id: "d1", customerId: "c1", customerName: "Amit Sharma", delivered: 2, returned: 1, person: "Suresh", revenue: 60, time: "09:30 AM" },
  { id: "d2", customerId: "c2", customerName: "Priya Singh", delivered: 1, returned: 0, person: "Suresh", revenue: 35, time: "10:15 AM" },
  { id: "d3", customerId: "c3", customerName: "Vikas Patel", delivered: 3, returned: 2, person: "Suresh", revenue: 90, time: "11:00 AM" },
  { id: "d4", customerId: "c6", customerName: "Kavitha Reddy", delivered: 2, returned: 1, person: "Suresh", revenue: 80, time: "12:30 PM" },
];

const MONTHLY_REVENUE = [
  { month: "Aug", revenue: 92000 }, { month: "Sep", revenue: 98000 }, { month: "Oct", revenue: 105000 },
  { month: "Nov", revenue: 112000 }, { month: "Dec", revenue: 108000 }, { month: "Jan", revenue: 124500 },
];

const DAILY_DELIVERIES = [
  { day: "Mon", count: 42 }, { day: "Tue", count: 38 }, { day: "Wed", count: 45 },
  { day: "Thu", count: 40 }, { day: "Fri", count: 48 }, { day: "Sat", count: 35 }, { day: "Sun", count: 22 },
];

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, className = "" }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    customers: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    delivery: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    inventory: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    billing: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    reports: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    tenants: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    sun: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    droplet: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    chevronDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"/></svg>,
    print: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    whatsapp: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  };
  return icons[name] || null;
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function AquaTrack() {
  const [user, setUser] = useState(() => {
  const saved = localStorage.getItem('user');
  return saved ? JSON.parse(saved) : null;
});
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  //const [customers, setCustomers] = useState(CUSTOMERS);
  const [customers, setCustomers] = useState([]);
  const [deliveries, setDeliveries] = useState(DELIVERIES_TODAY);
  const [showModal, setShowModal] = useState(null);
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };
  const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
  };

  const theme = {
    bg: darkMode ? "bg-gray-950" : "bg-slate-50",
    sidebar: darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100",
    card: darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100",
    text: darkMode ? "text-gray-100" : "text-gray-800",
    subtext: darkMode ? "text-gray-400" : "text-gray-500",
    input: darkMode ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-white border-gray-200 text-gray-800 placeholder-gray-400",
    hover: darkMode ? "hover:bg-gray-800" : "hover:bg-slate-50",
    tableRow: darkMode ? "border-gray-800 hover:bg-gray-800/50" : "border-gray-50 hover:bg-blue-50/30",
    header: darkMode ? "bg-gray-900/80 border-gray-800" : "bg-white/80 border-gray-100",
  };

  if (!user) return <LoginPage onLogin={(u) => { setUser(u); setActiveTab(u.role === 'superadmin' ? 'dashboard' : 'delivery'); }} darkMode={darkMode} />;

  const navItems = user.role === "superadmin"
    ? [{ id: "dashboard", label: "Dashboard", icon: "dashboard" }, { id: "tenants", label: "Tenants", icon: "tenants" }, { id: "reports", label: "Reports", icon: "reports" }]
    : user.role === "admin"
    ? [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "customers", label: "Customers", icon: "customers" },
        { id: "delivery", label: "Daily Delivery", icon: "delivery" },
        { id: "inventory", label: "Inventory", icon: "inventory" },
        { id: "billing", label: "Billing", icon: "billing" },
        { id: "reports", label: "Reports", icon: "reports" },
        { id: "team", label: "Team", icon: "customers" },
      ]
    : [
        { id: "delivery", label: "Daily Delivery", icon: "delivery" },
      ];

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${theme.bg} ${theme.text}`}
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-2 transition-all
          ${notification.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          <Icon name={notification.type === "success" ? "check" : "alert"} size={16} />
          {notification.msg}
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setShowModal(null)}>
          <div onClick={e => e.stopPropagation()} className={`w-full max-w-lg rounded-2xl shadow-2xl ${darkMode ? "bg-gray-900" : "bg-white"} p-6`}>
            {showModal}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 flex flex-col border-r ${theme.sidebar} shadow-sm z-20 shrink-0`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
            <Icon name="droplet" size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-bold text-sm text-cyan-600">AquaTrack</div>
              <div className={`text-xs ${theme.subtext}`}>v2.0 Pro</div>
            </div>
          )}
        </div>

        {/* Tenant Badge */}
        {sidebarOpen && user.role !== "superadmin" && (
          <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <div className="text-xs font-semibold text-cyan-600">AquaPure Distributors</div>
            <div className={`text-xs ${theme.subtext}`}>Pro Plan • Active</div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto mt-2">
          {navItems.map(item => (
            <button key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${activeTab === item.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/20"
                  : `${theme.subtext} ${theme.hover}`}`}>
              <Icon name={item.icon} size={18} className="shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className={`p-3 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
          <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${theme.hover} cursor-pointer`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.avatar}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{user.name}</div>
                <div className={`text-xs ${theme.subtext} capitalize`}>{user.role}</div>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} className={`${theme.subtext} hover:text-red-500 transition-colors`}>
                <Icon name="logout" size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`flex items-center gap-4 px-6 py-3 border-b backdrop-blur-md ${theme.header} z-10`}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`${theme.subtext} hover:text-cyan-500 transition-colors`}>
            <Icon name="menu" size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold capitalize">{activeTab === "dashboard" ? "Dashboard Overview" : activeTab}</h1>
            <p className={`text-xs ${theme.subtext}`}>Sunday, 1 March 2026</p>
          </div>

          {/* Search */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${theme.input} w-48`}>
            <Icon name="search" size={14} className={theme.subtext} />
            <input className="bg-transparent outline-none w-full text-xs" placeholder="Search..." />
          </div>

          <button className={`relative ${theme.subtext} hover:text-cyan-500 transition-colors`}>
            <Icon name="bell" size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
          </button>
          
          <button onClick={() => setDarkMode(!darkMode)} className={`${theme.subtext} hover:text-cyan-500 transition-colors`}>
            <Icon name={darkMode ? "sun" : "moon"} size={18} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "dashboard" && <DashboardPage user={user} theme={theme} darkMode={darkMode} deliveries={deliveries} customers={customers} />}
          {activeTab === "customers" && <CustomersPage theme={theme} darkMode={darkMode} customers={customers} setCustomers={setCustomers} notify={notify} setShowModal={setShowModal} />}
          {activeTab === "delivery" && <DeliveryPage theme={theme} darkMode={darkMode} deliveries={deliveries} setDeliveries={setDeliveries} customers={customers} notify={notify} user={user} />}
          {activeTab === "inventory" && <InventoryPage theme={theme} darkMode={darkMode} customers={customers} notify={notify} />}
          {activeTab === "billing" && <BillingPage theme={theme} darkMode={darkMode} notify={notify} user={user} />}
          {activeTab === "reports" && <ReportsPage theme={theme} darkMode={darkMode} deliveries={deliveries} />}
          {activeTab === "tenants" && <TenantsPage theme={theme} darkMode={darkMode} notify={notify} user={user} setUser={setUser} />}
          {activeTab === "team" && <TeamPage theme={theme} darkMode={darkMode} notify={notify} user={user} />}
        </main>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin, darkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await loginAPI(email, password);
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Cannot connect to server. Is backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 flex items-center justify-center p-4">
      {/* BG decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "32px 32px"}} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 mb-4">
              <Icon name="droplet" size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">AquaTrack</h1>
            <p className="text-cyan-400/70 text-sm mt-1">Water Can Distribution System</p>
          </div>

          {/* Demo badges */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { label: "Admin", email: "admin@aquatrack.com", pass: "admin123" },
              { label: "Delivery", email: "delivery@aquatrack.com", pass: "del123" },
              { label: "Super", email: "super@aquatrack.com", pass: "super123" },
            ].map(d => (
              <button key={d.label} onClick={() => { setEmail(d.email); setPassword(d.pass); setError(""); }}
                className="text-xs py-1.5 px-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all">
                {d.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all text-sm"
                placeholder="admin@aquatrack.com" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Password</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                placeholder="••••••••" />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button onClick={handleLogin} disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30 disabled:opacity-60">
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </div>

          <p className="text-center text-xs text-yellow-600 mt-6"> Contact : 8766425371 </p>
          <p className="text-center text-xs mt-2 italic font-semibold text-yellow-400">BIJODE & SON'S PRODUCT</p>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ user, theme, darkMode, deliveries, customers }) {
  const totalDelivered = deliveries.reduce((s, d) => s + d.delivered, 0);
  const totalReturned = deliveries.reduce((s, d) => s + d.returned, 0);
  const todayRevenue = deliveries.reduce((s, d) => s + d.revenue, 0);
  const activeCustomers = customers.filter(c => c.active).length;
  const totalDue = customers.reduce((s, c) => s + c.balance, 0);
  const warehouseStock = 250 - totalDelivered + totalReturned;

  const stats = [
    { label: "Total Customers", value: customers.length, sub: `${activeCustomers} active`, color: "from-blue-500 to-cyan-500", icon: "customers" },
    { label: "Today Deliveries", value: totalDelivered, sub: `${deliveries.length} stops`, color: "from-emerald-500 to-teal-500", icon: "delivery" },
    { label: "Warehouse Stock", value: warehouseStock, sub: "cans available", color: warehouseStock < 50 ? "from-red-500 to-orange-500" : "from-violet-500 to-purple-500", icon: "inventory" },
    { label: "Today Revenue", value: `₹${todayRevenue}`, sub: "collected today", color: "from-amber-500 to-orange-500", icon: "billing" },
    { label: "Total Due", value: `₹${totalDue}`, sub: "outstanding", color: "from-rose-500 to-pink-500", icon: "reports" },
    { label: "Monthly Revenue", value: "₹1.24L", sub: "January 2026", color: "from-cyan-500 to-blue-600", icon: "reports" },
  ];

  const maxRev = Math.max(...MONTHLY_REVENUE.map(m => m.revenue));
  const maxDel = Math.max(...DAILY_DELIVERIES.map(d => d.count));

  return (
    <div className="p-6 space-y-6">
      {/* Low stock alert */}
      {warehouseStock < 100 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600">
          <Icon name="alert" size={18} />
          <span className="text-sm font-medium">Low Stock Alert: Only {warehouseStock} cans remaining in warehouse</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`${theme.card} border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <Icon name={s.icon} size={15} className="text-white" />
            </div>
            <div className="text-xl font-bold">{s.value}</div>
            <div className={`text-xs font-medium mt-0.5`}>{s.label}</div>
            <div className={`text-xs ${theme.subtext} mt-0.5`}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className={`lg:col-span-2 ${theme.card} border rounded-2xl p-5 shadow-sm`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-sm">Monthly Revenue</h3>
              <p className={`text-xs ${theme.subtext}`}>Last 6 months</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-medium">+12.4%</span>
          </div>
          <div className="flex items-end gap-3 h-36">
            {MONTHLY_REVENUE.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`text-xs font-semibold ${theme.subtext}`} style={{fontSize: "10px"}}>
                  ₹{(m.revenue/1000).toFixed(0)}k
                </div>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-blue-500 transition-all duration-500 hover:opacity-80 cursor-pointer"
                  style={{ height: `${(m.revenue / maxRev) * 100}%`, minHeight: 8 }} />
                <div className={`text-xs ${theme.subtext}`} style={{fontSize: "10px"}}>{m.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Delivery Trend */}
        <div className={`${theme.card} border rounded-2xl p-5 shadow-sm`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-sm">This Week</h3>
              <p className={`text-xs ${theme.subtext}`}>Daily deliveries</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-36">
            {DAILY_DELIVERIES.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400 transition-all"
                  style={{ height: `${(d.count / maxDel) * 100}%`, minHeight: 4 }} />
                <div className={`text-xs ${theme.subtext}`} style={{fontSize: "10px"}}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Deliveries */}
        <div className={`${theme.card} border rounded-2xl shadow-sm overflow-hidden`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? "border-gray-800" : "border-gray-50"}`}>
            <h3 className="font-semibold text-sm">Today's Deliveries</h3>
            <span className="text-xs px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-600">{deliveries.length} trips</span>
          </div>
          <div className="divide-y divide-opacity-50" style={{divideColor: darkMode ? "#1f2937" : "#f8fafc"}}>
            {deliveries.map(d => (
              <div key={d.id} className={`flex items-center gap-3 px-5 py-3 ${theme.hover} transition-colors`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {d.customerName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{d.customerName}</div>
                  <div className={`text-xs ${theme.subtext}`}>{d.time}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-emerald-500">₹{d.revenue}</div>
                  <div className={`text-xs ${theme.subtext}`}>↑{d.delivered} ↓{d.returned}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className={`${theme.card} border rounded-2xl shadow-sm overflow-hidden`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? "border-gray-800" : "border-gray-50"}`}>
            <h3 className="font-semibold text-sm">Top Customers</h3>
            <span className={`text-xs ${theme.subtext}`}>by volume</span>
          </div>
          <div className="p-5 space-y-3">
            {customers.filter(c => c.active).sort((a, b) => b.cansOut - a.cansOut).slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className={`text-xs font-bold w-5 text-right ${theme.subtext}`}>{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{c.name}</div>
                  <div className="h-1.5 rounded-full bg-gray-100 mt-1 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                      style={{ width: `${(c.cansOut / 5) * 100}%` }} />
                  </div>
                </div>
                <span className={`text-xs font-bold shrink-0`}>{c.cansOut} cans</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────



function CustomersPage({ theme, darkMode, customers, setCustomers, notify, setShowModal }) {
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("All");
  const [editCustomer, setEditCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const data = await getCustomersAPI();
    if (data.success) setCustomers(data.customers);
    setLoading(false);
  };

  const areas = ["All", ...new Set(customers.map(c => c.area))];
  const filtered = customers.filter(c =>
    (areaFilter === "All" || c.area === areaFilter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search))
  );

  const handleDelete = async (id) => {
    await deleteCustomerAPI(id);
    setCustomers(prev => prev.filter(c => c._id !== id));
    notify("Customer deleted successfully");
    setShowModal(null);
  };

  const handleSave = async (formData) => {
    if (formData._id) {
      const data = await updateCustomerAPI(formData._id, formData);
      if (data.success) {
        setCustomers(prev => prev.map(c => c._id === formData._id ? data.customer : c));
        notify("Customer updated!");
      }
    } else {
      const data = await createCustomerAPI(formData);
      if (data.success) {
        setCustomers(prev => [data.customer, ...prev]);
        notify("Customer added!");
      }
    }
    setShowModal(null);
  };

  const openForm = (customer = null) => {
    const initial = customer || { name: "", mobile: "", address: "", area: "", rate: 30, deposit: 500, active: true };
    setShowModal(
      <CustomerForm initial={initial} onSave={handleSave} onCancel={() => setShowModal(null)} darkMode={darkMode} theme={theme} />
    );
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm flex-1 min-w-48 ${theme.input}`}>
          <Icon name="search" size={15} className={theme.subtext} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-sm" placeholder="Search customers..." />
        </div>
        <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}
          className={`px-3 py-2 rounded-xl border text-sm ${theme.input} outline-none`}>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <button onClick={() => openForm()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium shadow-md hover:opacity-90 transition-opacity">
          <Icon name="plus" size={15} /> Add Customer
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-10 text-cyan-500 font-medium text-sm">
          Loading customers...
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className={`${theme.card} border rounded-2xl shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs font-semibold uppercase tracking-wider ${theme.subtext} border-b ${darkMode ? "border-gray-800 bg-gray-800/40" : "border-gray-100 bg-slate-50"}`}>
                  <th className="text-left px-5 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Area</th>
                  <th className="text-left px-4 py-3">Rate</th>
                  <th className="text-left px-4 py-3">Cans Out</th>
                  <th className="text-left px-4 py-3">Cans Returned</th>
                  <th className="text-left px-4 py-3">Balance</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id} className={`border-b ${theme.tableRow} transition-colors`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {c.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-xs">{c.name}</div>
                          <div className={`text-xs ${theme.subtext}`}>{c.mobile}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{c.area}</td>
                    <td className="px-4 py-3 text-xs font-semibold">₹{c.rate}</td>
                    <td className="px-4 py-3"><span className="text-xs font-bold text-blue-500">{c.cansOut || 0}</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-bold text-emerald-500">{c.cansReturned || 0}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${c.balance > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                        {c.balance > 0 ? `₹${c.balance}` : "Clear"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.active ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500"}`}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openForm(c)}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors">
                          <Icon name="edit" size={14} />
                        </button>
                        <button onClick={() => setShowModal(
                          <DeleteConfirm name={c.name} onConfirm={() => handleDelete(c._id)} onCancel={() => setShowModal(null)} darkMode={darkMode} theme={theme} />
                        )} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={`px-5 py-3 border-t ${darkMode ? "border-gray-800" : "border-gray-50"} flex items-center justify-between`}>
            <span className={`text-xs ${theme.subtext}`}>Showing {filtered.length} of {customers.length} customers</span>
            <div className="flex gap-1">
              {["1", "2"].map(p => (
                <button key={p} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === "1" ? "bg-cyan-500 text-white" : `${theme.subtext} ${theme.hover}`}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerForm({ initial, onSave, onCancel, darkMode, theme }) {
  const [form, setForm] = useState(initial);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = `w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-cyan-500 transition-colors ${theme.input}`;
  return (
    <div>
      <h2 className="text-lg font-bold mb-5">{initial.id ? "Edit Customer" : "Add Customer"}</h2>
      <div className="grid grid-cols-2 gap-3">
        {[["name", "Name", "text"], ["mobile", "Mobile", "text"], ["address", "Address", "text"], ["area", "Area", "text"]].map(([k, label, type]) => (
          <div key={k} className={k === "address" ? "col-span-2" : ""}>
            <label className={`text-xs ${theme.subtext} mb-1 block`}>{label}</label>
            <input type={type} value={form[k] || ""} onChange={e => f(k, e.target.value)} className={inputCls} />
          </div>
        ))}
        <div>
          <label className={`text-xs ${theme.subtext} mb-1 block`}>Rate per Can (₹)</label>
          <input type="number" value={form.rate} onChange={e => f("rate", +e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={`text-xs ${theme.subtext} mb-1 block`}>Security Deposit (₹)</label>
          <input type="number" value={form.deposit} onChange={e => f("deposit", +e.target.value)} className={inputCls} />
        </div>
        <div className="col-span-2 flex items-center gap-3">
          <label className={`text-sm ${theme.subtext}`}>Active</label>
          <button onClick={() => f("active", !form.active)}
            className={`w-10 h-5 rounded-full transition-colors ${form.active ? "bg-emerald-500" : "bg-gray-300"} relative`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.active ? "left-5.5 left-[22px]" : "left-0.5"}`} />
          </button>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onCancel} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${theme.input} hover:opacity-80 transition-opacity`}>Cancel</button>
        <button onClick={() => onSave(form)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          {initial.id ? "Save Changes" : "Add Customer"}
        </button>
      </div>
    </div>
  );
}

function DeleteConfirm({ name, onConfirm, onCancel, theme }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
        <Icon name="trash" size={24} className="text-red-500" />
      </div>
      <h3 className="font-bold text-lg mb-2">Delete Customer?</h3>
      <p className={`text-sm ${theme.subtext} mb-6`}>This will permanently delete <strong>{name}</strong> and all their data.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${theme.input}`}>Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
      </div>
    </div>
  );
}

// ─── DELIVERY ─────────────────────────────────────────────────────────────────

function DeliveryPage({ theme, darkMode, deliveries, setDeliveries, customers: initialCustomers, notify, user }) {
  const today = new Date().toISOString().split("T")[0];
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
  customerId: '',
  delivered: '',
  returned: '',
  deliveryPersonName: user?.name || '',
  date: today
});
 
  const [loading, setLoading] = useState(false);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [search, setSearch] = useState("");
  const [personFilter, setPersonFilter] = useState("All");
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const selectedCustomer = customers.find(c => c._id === form.customerId);
  const revenue = selectedCustomer ? form.delivered * selectedCustomer.rate : 0;
  const ic = `w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-cyan-500 ${theme.input}`;

 useEffect(() => {
  fetchTodayDeliveries();
  getCustomersAPI().then(data => {
    if (data.success) setCustomers(data.customers);
  }).catch(() => {});
  getDeliveryPersonsAPI().then(data => {
    if (data.success) setDeliveryPersons(data.persons);
  }).catch(() => {});
}, []);

  const fetchTodayDeliveries = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = await getDeliveriesAPI({ date: today });
      if (data.success) setDeliveries(data.deliveries);
    } catch {}
  };

  const handleAdd = async () => {
    if (!form.customerId) return notify("Select a customer", "error");
    setLoading(true);
    try {
      const data = await createDeliveryAPI({
        customerId: form.customerId,
        delivered: +form.delivered,
        returned: +form.returned,
        date: form.date,
        deliveryPersonName: form.deliveryPersonName
      });
      if (data.success) {
        setDeliveries(prev => [data.delivery, ...prev]);
        notify(`Delivery logged for ${selectedCustomer.name}`);
        setForm(p => ({ ...p, customerId: "", delivered: 1, returned: 0 }));
      } else {
        notify(data.message || "Failed", "error");
      }
    } catch { notify("Server error", "error"); }
    setLoading(false);
  };

  const handleEdit = (d) => {
  setEditingDelivery(d);
  setForm({
    customerId: d.customerId?._id || d.customerId,
    delivered: d.delivered,
    returned: d.returned,
    deliveryPersonName: d.deliveryPersonName,
    date: new Date(d.date).toISOString().split("T")[0]
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleUpdate = async () => {
  if (!form.customerId) return notify("Select a customer", "error");
  setLoading(true);
  try {
    const data = await updateDeliveryAPI(editingDelivery._id, {
      customerId: form.customerId,
      delivered: +form.delivered,
      returned: +form.returned,
      date: form.date,
      deliveryPersonName: form.deliveryPersonName
    });
    if (data.success) {
      setDeliveries(prev => prev.map(d => d._id === editingDelivery._id ? data.delivery : d));
      notify("Delivery updated!");
      setEditingDelivery(null);
      setForm({ customerId: '', delivered: '', returned: '', deliveryPersonName: user?.name || '', date: today });
    } else {
      notify(data.message || "Failed", "error");
    }
  } catch { notify("Server error", "error"); }
  setLoading(false);
};

  const persons = ["All", ...new Set(deliveries.map(d => d.deliveryPersonName).filter(Boolean))];

const filtered = deliveries.filter(d => {
  const name = (d.customerName || d.customerId?.name || "").toLowerCase();
  const person = (d.deliveryPersonName || "").toLowerCase();
  const matchSearch = search === "" || name.includes(search.toLowerCase()) || person.includes(search.toLowerCase());
  const matchPerson = personFilter === "All" || d.deliveryPersonName === personFilter;
  return matchSearch && matchPerson;
});

const totalRevenue = filtered.reduce((s, d) => s + d.revenue, 0);
const totalDelivered = filtered.reduce((s, d) => s + d.delivered, 0);
const totalReturned = filtered.reduce((s, d) => s + d.returned, 0);
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className={`${theme.card} border rounded-2xl p-5 shadow-sm`}>
          <h3 className="font-semibold text-sm mb-5">Log Delivery</h3>
          <div className="space-y-4">
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Date</label>
              <input type="date" value={form.date} onChange={e => f("date", e.target.value)} className={ic} />
            </div>
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Customer</label>
              <select value={form.customerId} onChange={e => f("customerId", e.target.value)} className={`${ic} cursor-pointer`}>
                <option value="">Select Customer...</option>
                {customers.filter(c => c.active).map(c => (
                  <option key={c._id} value={c._id}>{c.name} – {c.area}</option>
                ))}
              </select>
            </div>
            {selectedCustomer && (
              <div className={`px-3 py-2 rounded-xl ${darkMode ? "bg-cyan-500/10" : "bg-cyan-50"} border border-cyan-500/20`}>
                <div className="text-xs text-cyan-600 font-medium">
                  Rate: ₹{selectedCustomer.rate}/can • {selectedCustomer.cansOut || 0} cans currently out
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-xs ${theme.subtext} mb-1 block`}>Delivered</label>
                <input type="number" min="0" value={form.delivered} onChange={e => f("delivered", +e.target.value)} className={ic} />
              </div>
              <div>
                <label className={`text-xs ${theme.subtext} mb-1 block`}>Returned</label>
                <input type="number" min="0" value={form.returned} onChange={e => f("returned", +e.target.value)} className={ic} />
              </div>
            </div>
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Delivery Person</label>
                 {user?.role === 'delivery' ? (
                   <input value={user.name} readOnly className={`${ic} opacity-60 cursor-not-allowed`} />
              ) : (
               <select value={form.deliveryPersonName} onChange={e => f("deliveryPersonName", e.target.value)}
               className={`${ic} cursor-pointer`}>
               <option value="">Select Person...</option>
              {deliveryPersons.map(p => (
            <option key={p._id} value={p.name}>{p.name} — {p.area || 'No area'}</option>
          ))}
    <option value="Other">Other</option>
     </select>
          )}
            </div>
            {selectedCustomer && (
              <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xs text-emerald-600 font-semibold">Revenue: ₹{revenue}</div>
                <div className="text-xs text-emerald-600/70">Net delivered: {form.delivered - form.returned} cans</div>
              </div>
            )}
            {editingDelivery && (
  <button onClick={() => { setEditingDelivery(null); setForm({ customerId: '', delivered: '', returned: '', deliveryPersonName: user?.name || '', date: today }); }}
    className="w-full py-2 rounded-xl border text-sm mb-2 text-gray-500">
    Cancel Edit
  </button>
)}
<button onClick={editingDelivery ? handleUpdate : handleAdd} disabled={loading}
  className={`w-full py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity shadow-md
    ${editingDelivery ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-cyan-500 to-blue-600"}`}>
  {loading ? "Saving..." : editingDelivery ? "Update Delivery" : "Log Delivery"}
</button>
          </div>
        </div>

        {/* Table */}
        <div className={`lg:col-span-2 ${theme.card} border rounded-2xl shadow-sm overflow-hidden`}>
         <div className={`px-5 py-4 border-b ${darkMode ? "border-gray-800" : "border-gray-100"} space-y-3`}>
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-semibold text-sm">Today's Log</h3>
      <p className={`text-xs ${theme.subtext}`}>
        {filtered.length} of {deliveries.length} deliveries • ↑{totalDelivered} ↓{totalReturned} • ₹{totalRevenue}
      </p>
    </div>
  </div>
  <div className="flex gap-2">
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm flex-1 ${theme.input}`}>
      <Icon name="search" size={14} className={theme.subtext} />
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="bg-transparent outline-none w-full text-xs"
        placeholder="Search customer..."
      />
      {search && (
        <button onClick={() => setSearch("")} className={theme.subtext}>
          <Icon name="x" size={13} />
        </button>
      )}
         </div>
             <select
         value={personFilter}
         onChange={e => setPersonFilter(e.target.value)}
         className={`px-3 py-2 rounded-xl border text-xs outline-none ${theme.input}`}>
         {persons.map(p => <option key={p}>{p}</option>)}
          </select>
         </div>
       </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs font-semibold uppercase ${theme.subtext} border-b ${darkMode ? "border-gray-800 bg-gray-800/40" : "border-gray-50 bg-slate-50"}`}>
                  {["Customer", "Delivered", "Returned", "Person", "Revenue", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d._id} className={`border-b ${theme.tableRow}`}>
                    <td className="px-4 py-3 text-xs font-semibold">{d.customerName || d.customerId?.name}</td>
                    <td className="px-4 py-3"><span className="text-xs font-bold text-blue-500">{d.delivered}</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-bold text-emerald-500">{d.returned}</span></td>
                    <td className="px-4 py-3 text-xs">{d.deliveryPersonName}</td>
                    <td className="px-4 py-3"><span className="text-xs font-bold text-amber-500">₹{d.revenue}</span></td>
                    <td className="px-4 py-3">
                    <button onClick={() => handleEdit(d)}
                    className={`p-1.5 rounded-lg transition-colors ${editingDelivery?._id === d._id ? "bg-amber-500/20 text-amber-500" : "hover:bg-blue-500/10 text-blue-400"}`}>
                    <Icon name="edit" size={13} />
                    </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                 <tr><td colSpan="6" className={`text-center py-10 text-sm ${theme.subtext}`}>
                {deliveries.length === 0 ? "No deliveries logged today" : "No results found"}
               </td></tr>
               )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────
function InventoryPage({ theme, darkMode, notify }) {
  const [deliveries, setDeliveries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [personFilter, setPersonFilter] = useState("All");
  const now = new Date();
  const [viewMode, setViewMode] = useState("day"); // day | month
  const [selectedDate, setSelectedDate] = useState(now.toISOString().split("T")[0]);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const exportToExcel = () => {
  if (filtered.length === 0) return notify("No data to export", "error");

  const exportData = filtered.map((d, i) => ({
    "#": i + 1,
    "Date": new Date(d.date).toLocaleDateString('en-IN'),
    "Customer Name": d.customerName || d.customerId?.name || "",
    "Delivered": d.delivered,
    "Returned": d.returned,
    "Net Delivered": d.netDelivered,
    "Delivery Person": d.deliveryPersonName || "",
    "Rate per Can": d.ratePerCan || "",
    "Revenue (₹)": d.revenue,
  }));

  // Summary row at bottom
  exportData.push({
    "#": "",
    "Date": "",
    "Customer Name": "TOTAL",
    "Delivered": totalDelivered,
    "Returned": totalReturned,
    "Net Delivered": totalNet,
    "Delivery Person": "",
    "Rate per Can": "",
    "Revenue (₹)": totalRevenue,
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Deliveries");

  // File name based on current filter
  const label = viewMode === "day"
    ? selectedDate
    : `${months[selectedMonth - 1]}-${selectedYear}`;

  XLSX.writeFile(wb, `AquaTrack_Deliveries_${label}.xlsx`);
  notify("Excel exported successfully!");
};

  useEffect(() => {
  fetchDeliveries();
  getCustomersAPI().then(data => {
    if (data.success) setCustomers(data.customers);
  }).catch(() => {});
}, [viewMode, selectedDate, selectedMonth, selectedYear]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      let params = {};
      if (viewMode === "day") {
        params.date = selectedDate;
      } else {
        const start = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split("T")[0];
        const end = new Date(selectedYear, selectedMonth, 0).toISOString().split("T")[0];
        params.dateRange = `${start},${end}`;
      }
      const data = await getDeliveriesAPI(params);
      if (data.success) setDeliveries(data.deliveries);
    } catch {}
    setLoading(false);
  };

  // Unique delivery persons
  const persons = ["All", ...new Set(deliveries.map(d => d.deliveryPersonName).filter(Boolean))];

  // Apply filters
  const filtered = deliveries.filter(d => {
    const name = (d.customerName || d.customerId?.name || "").toLowerCase();
    const matchSearch = search === "" || name.includes(search.toLowerCase());
    const matchCustomer = customerFilter === "All" || (d.customerName || d.customerId?.name) === customerFilter;
    const matchPerson = personFilter === "All" || d.deliveryPersonName === personFilter;
    return matchSearch && matchCustomer && matchPerson;
  });

  // Summary stats
  const totalDelivered = filtered.reduce((s, d) => s + d.delivered, 0);
  const totalReturned = filtered.reduce((s, d) => s + d.returned, 0);
  const totalRevenue = filtered.reduce((s, d) => s + d.revenue, 0);
  const totalNet = totalDelivered - totalReturned;

  // Group by date for month view
  const groupedByDate = filtered.reduce((acc, d) => {
    const date = new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(d);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-5">

      {/* Header Controls */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Day / Month Toggle */}
        <div className={`flex rounded-xl border overflow-hidden ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          {["day", "month"].map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-4 py-2 text-xs font-semibold capitalize transition-colors
                ${viewMode === mode
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  : `${theme.subtext} ${theme.hover}`}`}>
              {mode === "day" ? "Day View" : "Month View"}
            </button>
          ))}
        </div>

        {/* Date Picker - Day Mode */}
        {viewMode === "day" && (
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-sm outline-none ${theme.input}`}
          />
        )}

        {/* Month + Year Picker - Month Mode */}
        {viewMode === "month" && (
          <>
            <select value={selectedMonth} onChange={e => setSelectedMonth(+e.target.value)}
              className={`px-3 py-2 rounded-xl border text-sm outline-none ${theme.input}`}>
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(+e.target.value)}
              className={`px-3 py-2 rounded-xl border text-sm outline-none ${theme.input}`}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </>
        )}

        
        {/* Refresh */}
        <button onClick={fetchDeliveries}
        className={`px-4 py-2 rounded-xl border text-xs font-medium ${theme.input} hover:opacity-80`}>
        Refresh
         </button>

      {/* Export Excel */}
          <button onClick={exportToExcel}
           className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold shadow-md hover:opacity-90 transition-opacity">
           <Icon name="download" size={14} />
            Export Excel
          </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm flex-1 min-w-48 ${theme.input}`}>
          <Icon name="search" size={14} className={theme.subtext} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-xs"
            placeholder="Search customer..." />
          {search && (
            <button onClick={() => setSearch("")} className={theme.subtext}>
              <Icon name="x" size={13} />
            </button>
          )}
        </div>
        <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}
          className={`px-3 py-2 rounded-xl border text-xs outline-none ${theme.input}`}>
          <option value="All">All Customers</option>
          {customers.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={personFilter} onChange={e => setPersonFilter(e.target.value)}
          className={`px-3 py-2 rounded-xl border text-xs outline-none ${theme.input}`}>
          {persons.map(p => <option key={p}>{p === "All" ? "All Persons" : p}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Deliveries", value: filtered.length, color: "from-blue-500 to-cyan-500" },
          { label: "Cans Delivered", value: totalDelivered, color: "from-emerald-500 to-teal-500" },
          { label: "Cans Returned", value: totalReturned, color: "from-violet-500 to-purple-500" },
          { label: "Net Cans Out", value: totalNet, color: "from-rose-500 to-red-500" },
          { label: "Total Revenue", value: `₹${totalRevenue}`, color: "from-amber-500 to-orange-500" },
        ].map((s, i) => (
          <div key={i} className={`${theme.card} border rounded-2xl p-4 shadow-sm`}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
              <Icon name="delivery" size={14} className="text-white" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className={`text-xs ${theme.subtext} mt-0.5`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && <div className="text-center py-10 text-cyan-500 text-sm">Loading deliveries...</div>}

      {/* DAY VIEW TABLE */}
      {!loading && viewMode === "day" && (
        <div className={`${theme.card} border rounded-2xl shadow-sm overflow-hidden`}>
          <div className={`px-5 py-3 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
            <span className="text-xs font-semibold">
              {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <span className={`ml-2 text-xs ${theme.subtext}`}>— {filtered.length} records</span>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
               <tr className={`text-xs font-semibold uppercase ${theme.subtext} border-b ${darkMode ? "border-gray-800 bg-gray-900" : "border-gray-100 bg-slate-50"}`}>
                {["#", "Customer", "Delivered", "Returned", "Net", "Person", "Revenue"].map(h => (
                    <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
                   ))}
                </tr>
               </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d._id} className={`border-b ${theme.tableRow}`}>
                    <td className={`px-4 py-3 text-xs ${theme.subtext}`}>{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(d.customerName || "?")[0]}
                        </div>
                        <span className="text-xs font-semibold">{d.customerName || d.customerId?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-bold text-blue-500">{d.delivered}</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-bold text-emerald-500">{d.returned}</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-bold text-violet-500">{d.netDelivered}</span></td>
                    <td className="px-4 py-3 text-xs">{d.deliveryPersonName}</td>
                    <td className="px-4 py-3"><span className="text-xs font-bold text-amber-500">₹{d.revenue}</span></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="7" className={`text-center py-10 text-sm ${theme.subtext}`}>
                    No deliveries found for this date
                  </td></tr>
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className={`${darkMode ? "bg-gray-800/60" : "bg-slate-50"} font-bold text-xs`}>
                    <td className="px-4 py-3" colSpan="2">Total</td>
                    <td className="px-4 py-3 text-blue-500">{totalDelivered}</td>
                    <td className="px-4 py-3 text-emerald-500">{totalReturned}</td>
                    <td className="px-4 py-3 text-violet-500">{totalNet}</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-amber-500">₹{totalRevenue}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* MONTH VIEW — grouped by date */}
      {!loading && viewMode === "month" && (
        <div className="space-y-4">
          {Object.keys(groupedByDate).length === 0 && (
            <div className={`${theme.card} border rounded-2xl p-10 text-center text-sm ${theme.subtext}`}>
              No deliveries found for {months[selectedMonth - 1]} {selectedYear}
            </div>
          )}
          {Object.entries(groupedByDate).map(([date, dayDeliveries]) => {
            const dayRevenue = dayDeliveries.reduce((s, d) => s + d.revenue, 0);
            const dayDelivered = dayDeliveries.reduce((s, d) => s + d.delivered, 0);
            const dayReturned = dayDeliveries.reduce((s, d) => s + d.returned, 0);
            return (
              <div key={date} className={`${theme.card} border rounded-2xl shadow-sm overflow-hidden`} style={{contain: "layout"}}>
                {/* Date Header */}
                <div className={`flex items-center justify-between px-5 py-3 border-b ${darkMode ? "border-gray-800 bg-gray-800/40" : "border-gray-50 bg-slate-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {new Date(dayDeliveries[0].date).getDate()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{date}</div>
                      <div className={`text-xs ${theme.subtext}`}>{dayDeliveries.length} deliveries</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-blue-500 font-semibold">↑{dayDelivered}</span>
                    <span className="text-emerald-500 font-semibold">↓{dayReturned}</span>
                    <span className="text-amber-500 font-bold">₹{dayRevenue}</span>
                  </div>
                </div>
                {/* Day Deliveries */}
                <div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead className="sticky top-0 z-10">
      <tr className={`text-xs font-semibold uppercase ${theme.subtext} border-b ${darkMode ? "border-gray-800 bg-gray-900" : "border-gray-100 bg-slate-50"}`}>
        {["#", "Customer", "Delivered", "Returned", "Person", "Revenue"].map(h => (
          <th key={h} className="text-left px-4 py-2 whitespace-nowrap">{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
                      {dayDeliveries.map((d, i) => (
                        <tr key={d._id} className={`border-b ${theme.tableRow}`}>
                          <td className={`px-4 py-2.5 text-xs ${theme.subtext} w-8`}>{i + 1}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {(d.customerName || "?")[0]}
                              </div>
                              <span className="text-xs font-semibold">{d.customerName || d.customerId?.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5"><span className="text-xs font-bold text-blue-500">↑{d.delivered}</span></td>
                          <td className="px-4 py-2.5"><span className="text-xs font-bold text-emerald-500">↓{d.returned}</span></td>
                          <td className="px-4 py-2.5 text-xs">{d.deliveryPersonName}</td>
                          <td className="px-4 py-2.5"><span className="text-xs font-bold text-amber-500">₹{d.revenue}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── BILLING ─────────────────────────────────────────────────────────────────
// ─── BILLING PAGE ─────────────────────────────────────────────────────────────
// Replace your existing BillingPage function in App.jsx with this complete version

function BillingPage({ theme, darkMode, notify, user }) {
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  useEffect(() => {
    fetchInvoices();
  }, [month, year]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoicesAPI({ month, year });
      if (data.success) setInvoices(data.invoices);
    } catch {}
    setLoading(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await generateBillingAPI(month, year);
      if (data.success) {
        notify(`Generated ${data.count} invoices for ${months[month-1]} ${year}!`);
        fetchInvoices();
      } else {
        notify(data.message || "Failed to generate", "error");
      }
    } catch {
      notify("Server error", "error");
    }
    setGenerating(false);
  };

  const handlePay = async (id, totalAmount) => {
    try {
      const data = await markAsPaidAPI(id, totalAmount);
      if (data.success) {
        setInvoices(prev => prev.map(inv => inv._id === id ? data.invoice : inv));
        notify("Marked as paid!");
        setSelected(null);
      }
    } catch {
      notify("Failed to update", "error");
    }
  };

  const handlePrint = (inv) => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${inv.invoiceNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f7fa; padding: 30px; color: #1a1a2e; }
        .page { background: white; max-width: 720px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
        .header { background: linear-gradient(135deg, #0ea5e9, #2563eb); padding: 32px 40px; display: flex; justify-content: space-between; align-items: flex-start; }
        .company-name { color: white; font-size: 26px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; }
        .company-sub { color: rgba(255,255,255,0.75); font-size: 13px; margin-top: 4px; }
        .invoice-label { text-align: right; }
        .invoice-title { color: white; font-size: 28px; font-weight: 900; letter-spacing: 2px; }
        .invoice-no { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 4px; }
        .status-bar { padding: 10px 40px; display: flex; justify-content: flex-end; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .badge { padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .badge-paid { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
        .badge-pending { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
        .body { padding: 32px 40px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 8px; }
        .info-value { font-size: 15px; font-weight: 700; color: #1e293b; }
        .info-sub { font-size: 13px; color: #475569; margin-top: 3px; }
        .table-wrap { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; }
        thead { background: #f1f5f9; }
        thead th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        thead th:last-child { text-align: right; }
        tbody td { padding: 14px 16px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; }
        tbody td:last-child { text-align: right; font-weight: 600; }
        tbody tr:last-child td { border-bottom: none; }
        .totals { margin-left: auto; width: 280px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #475569; border-bottom: 1px solid #f1f5f9; }
        .total-final { display: flex; justify-content: space-between; padding: 14px 16px; background: #f8fafc; border: 2px solid #1e293b; border-radius: 10px; margin-top: 12px; }
        .total-final span { color: #1e293b; font-weight: 900; font-size: 18px; }
        .payment-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center; }
        .payment-box.pending { background: #fffbeb; border-color: #fde68a; }
        .payment-label { font-size: 12px; color: #64748b; font-weight: 600; }
        .payment-value { font-size: 15px; font-weight: 800; color: #16a34a; }
        .payment-value.pending { color: #d97706; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center; }
        .footer p { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
        .thank { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 6px; }
        @media print { body { background: white; padding: 0; } .page { box-shadow: none; border-radius: 0; } }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
        <div>
         <div class="company-name">💧 ${currentUser?.tenantName || 'AquaTrack'}</div>
         <div class="company-sub" style="margin-top:6px">📍 ${currentUser?.tenantAddress || ''}</div>
         <div class="company-sub">📞 ${currentUser?.tenantPhone || ''} | ✉️ ${currentUser?.tenantEmail || ''}</div>
         </div>
         <div class="invoice-label">
         <div class="invoice-title">INVOICE</div>
         <div class="invoice-no">${inv.invoiceNo}</div>
        </div>
        </div>
        <div class="body">
          <div class="info-grid">
            <div>
              <div class="info-label">Bill To</div>
              <div class="info-value">${inv.customerName}</div>
              <div class="info-sub">${inv.customerMobile || ''}</div>
              <div class="info-sub">${inv.customerAddress || ''}</div>
            </div>
            <div>
              <div class="info-label">Invoice Details</div>
              <div class="info-sub">Period: <strong>${months[inv.month - 1]} ${inv.year}</strong></div>
              <div class="info-sub">Date: <strong>${new Date().toLocaleDateString('en-IN')}</strong></div>
              <div class="info-sub">Invoice No: <strong>${inv.invoiceNo}</strong></div>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>20L Water Can Delivery</td>
                  <td>${inv.totalCansDelivered} cans</td>
                  <td>₹${inv.ratePerCan}/can</td>
                  <td>₹${inv.subtotal}</td>
                </tr>
                
                ${inv.previousBalance > 0 ? `
                <tr>
                  <td style="color:#ef4444">Previous Balance</td>
                  <td>-</td><td>-</td>
                  <td style="color:#ef4444">₹${inv.previousBalance}</td>
                </tr>` : ''}
              </tbody>
            </table>
          </div>
          <div class="totals">
            <div class="total-row"><span>Subtotal</span><span>₹${inv.subtotal}</span></div>
            ${inv.previousBalance > 0 ? `<div class="total-row"><span>Previous Balance</span><span style="color:#ef4444">+₹${inv.previousBalance}</span></div>` : ''}
            <div class="total-final"><span>Total Payable</span><span>₹${inv.totalAmount}</span></div>
          </div>
         ${inv.paid ? `
          <div class="payment-box">
            <div><div class="payment-label">Amount Paid</div><div class="payment-value">₹${inv.paidAmount}</div></div>
            <div style="text-align:right"><div class="payment-label">Payment Date</div><div class="payment-value">${new Date(inv.paidDate).toLocaleDateString('en-IN')}</div></div>
          </div>` : ''}
        </div>
        <div class="footer">
          <p class="thank">Thank you for your business!</p>
          <p>${currentUser?.tenantName || ''} | 📞 ${currentUser?.tenantPhone || ''} | ✉️ ${currentUser?.tenantEmail || ''}</p>
          <p>This is a computer generated invoice.</p>
        </div>
      </div>
      <script>window.onload = () => { window.print(); }</script>
    </body>
    </html>
  `);
  win.document.close();
};

  return (
    <div className="p-6 space-y-5">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={month} onChange={e => setMonth(+e.target.value)}
          className={`px-3 py-2 rounded-xl border text-sm outline-none ${theme.input}`}>
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m} {year}</option>
          ))}
        </select>
        <select value={year} onChange={e => setYear(+e.target.value)}
          className={`px-3 py-2 rounded-xl border text-sm outline-none ${theme.input}`}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium shadow-md hover:opacity-90 disabled:opacity-60 transition-opacity">
          <Icon name="billing" size={15} />
          {generating ? "Generating..." : "Generate Bills"}
        </button>
        <button onClick={fetchInvoices}
          className={`px-4 py-2 rounded-xl border text-sm font-medium ${theme.input} hover:opacity-80`}>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Invoices", value: invoices.length, color: "text-blue-500" },
            { label: "Total Revenue", value: `₹${invoices.reduce((s,i)=>s+i.totalAmount,0)}`, color: "text-cyan-500" },
            { label: "Collected", value: `₹${invoices.reduce((s,i)=>s+i.paidAmount,0)}`, color: "text-emerald-500" },
            { label: "Pending", value: `₹${invoices.reduce((s,i)=>s+i.balanceAmount,0)}`, color: "text-rose-500" },
          ].map((s, i) => (
            <div key={i} className={`${theme.card} border rounded-2xl p-4 shadow-sm`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className={`text-xs ${theme.subtext} mt-1`}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && <div className="text-center py-10 text-cyan-500 text-sm">Loading invoices...</div>}

      {/* Invoice Table */}
      {!loading && (
        <div className={`${theme.card} border rounded-2xl shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs font-semibold uppercase ${theme.subtext} border-b ${darkMode ? "border-gray-800 bg-gray-800/40" : "border-gray-50 bg-slate-50"}`}>
                 {["Invoice No", "Customer", "Cans Delivered", "Cans Returned", "Amount", "Prev Balance", "Total", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id} className={`border-b ${theme.tableRow} transition-colors`}>
                    <td className="px-4 py-3 text-xs font-mono text-cyan-600">{inv.invoiceNo}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold">{inv.customerName}</div>
                      <div className={`text-xs ${theme.subtext}`}>{inv.customerMobile}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{inv.totalCansDelivered}</td>
                    <td className="px-4 py-3 text-xs"><span className="text-xs font-bold text-emerald-500">{inv.totalCansReturned}</span></td>
                    <td className="px-4 py-3 text-xs font-semibold">₹{inv.subtotal}</td>
                    <td className="px-4 py-3 text-xs text-rose-500">₹{inv.previousBalance}</td>
                    <td className="px-4 py-3 text-xs font-bold">₹{inv.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium
                        ${inv.paid ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                        {inv.paid ? "✓ Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(inv)}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors" title="View Invoice">
                          <Icon name="print" size={13} />
                        </button>
                        <button onClick={() => handlePrint(inv)}
                          className="p-1.5 rounded-lg hover:bg-violet-500/10 text-violet-500 transition-colors" title="Print PDF">
                          <Icon name="download" size={13} />
                        </button>
                        {!inv.paid && (
                          <button onClick={() => handlePay(inv._id, inv.totalAmount)}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-colors" title="Mark Paid">
                            <Icon name="check" size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan="9" className={`text-center py-12 ${theme.subtext}`}>
                      <div className="text-sm font-medium mb-1">No invoices for {months[month-1]} {year}</div>
                      <div className="text-xs">Click "Generate Bills" to create invoices from deliveries</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Icon name="droplet" size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">AquaPure Distributors</div>
                  <div className="text-xs text-gray-500">Water Can Distribution</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)}>
                <Icon name="x" size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Invoice Info */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Invoice No:</span>
                <strong className="text-cyan-600 font-mono">{selected.invoiceNo}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Period:</span>
                <span className="font-semibold">{months[selected.month-1]} {selected.year}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Customer:</span>
                <strong>{selected.customerName}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Mobile:</span>
                <span>{selected.customerMobile}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selected.paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {selected.paid ? "✓ Paid" : "Pending"}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full text-xs mb-4">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-gray-400 font-medium">Description</th>
                  <th className="text-right pb-2 text-gray-400 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-50">
                  <td className="py-2">{selected.totalCansDelivered} cans × ₹{selected.ratePerCan}</td>
                  <td className="py-2 text-right font-semibold">₹{selected.subtotal}</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-2 text-gray-400">Cans Returned: {selected.totalCansReturned}</td>
                  <td className="py-2 text-right text-gray-400">-</td>
                </tr>
                {selected.previousBalance > 0 && (
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-rose-500">Previous Balance</td>
                    <td className="py-2 text-right text-rose-500">₹{selected.previousBalance}</td>
                  </tr>
                )}
                {selected.paidAmount > 0 && (
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-emerald-600">Amount Paid</td>
                    <td className="py-2 text-right text-emerald-600">₹{selected.paidAmount}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-between items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl px-4 py-3 mb-4">
              <div>
                <div className="font-semibold text-sm">Total Payable</div>
                {selected.balanceAmount < selected.totalAmount && (
                  <div className="text-xs text-cyan-100">Balance: ₹{selected.balanceAmount}</div>
                )}
              </div>
              <span className="font-bold text-xl">₹{selected.totalAmount}</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handlePrint(selected)}
                className="py-2.5 rounded-xl bg-blue-500/10 text-blue-600 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-500/20 transition-colors">
                <Icon name="print" size={13} /> Print
              </button>
              <button onClick={() => {
                const msg = `Invoice ${selected.invoiceNo} | ${selected.customerName} | ${months[selected.month-1]} ${selected.year} | Total: ₹${selected.totalAmount}`
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
              }} className="py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-emerald-500/20 transition-colors">
                <Icon name="whatsapp" size={13} /> WhatsApp
              </button>
              {!selected.paid ? (
                <button onClick={() => handlePay(selected._id, selected.totalAmount)}
                  className="py-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-cyan-500/20 transition-colors">
                  <Icon name="check" size={13} /> Mark Paid
                </button>
              ) : (
                <button className="py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold flex items-center justify-center gap-1">
                  <Icon name="check" size={13} /> Paid ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TEAM PAGE ────────────────────────────────────────────────────────────────
function TeamPage({ theme, darkMode, notify, user }) {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editPerson, setEditPerson] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', area: '' });

  const ic = `w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-cyan-500 ${theme.input}`;

  useEffect(() => { fetchPersons(); }, []);

  const fetchPersons = async () => {
    setLoading(true);
    try {
      const data = await getDeliveryPersonsAPI();
      if (data.success) setPersons(data.persons);
    } catch {}
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password)
      return notify("Name, email and password are required", "error");
    try {
      const data = await addDeliveryPersonAPI(form);
      if (data.success) {
        setPersons(prev => [data.user, ...prev]);
        notify("Delivery person added!");
        setShowForm(false);
        setForm({ name: '', email: '', password: '', mobile: '', area: '' });
      } else {
        notify(data.message || "Failed to add", "error");
      }
    } catch { notify("Server error", "error"); }
  };

  const handleUpdate = async () => {
    try {
      const data = await updateDeliveryPersonAPI(editPerson._id, {
        name: form.name, mobile: form.mobile, area: form.area, active: form.active
      });
      if (data.success) {
        setPersons(prev => prev.map(p => p._id === editPerson._id ? data.person : p));
        notify("Updated successfully!");
        setEditPerson(null);
        setForm({ name: '', email: '', password: '', mobile: '', area: '' });
      }
    } catch { notify("Server error", "error"); }
  };

  const handleDelete = async (id) => {
    try {
      const data = await deleteDeliveryPersonAPI(id);
      if (data.success) {
        setPersons(prev => prev.filter(p => p._id !== id));
        notify("Deleted successfully!");
      }
    } catch { notify("Server error", "error"); }
  };

  const openEdit = (person) => {
    setEditPerson(person);
    setForm({ name: person.name, mobile: person.mobile || '', area: person.area || '', active: person.active });
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">Delivery Team</h2>
          <p className={`text-xs ${theme.subtext}`}>{persons.length} delivery persons</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditPerson(null); setForm({ name: '', email: '', password: '', mobile: '', area: '' }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium shadow-md hover:opacity-90">
          <Icon name="plus" size={15} /> Add Person
        </button>
      </div>

      {showForm && (
        <div className={`${theme.card} border rounded-2xl p-5 shadow-sm`}>
          <h3 className="text-sm font-semibold mb-4">Add Delivery Person</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Full Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={ic} placeholder="Enter name" />
            </div>
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Mobile Number</label>
              <input value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} className={ic} placeholder="Enter mobile" />
            </div>
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Email *</label>
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={ic} placeholder="Enter email" />
            </div>
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Password *</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className={ic} placeholder="Min 6 characters" />
            </div>
            <div className="col-span-2">
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Area Assigned</label>
              <input value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} className={ic} placeholder="e.g. Koramangala, Indiranagar" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className={`flex-1 py-2.5 rounded-xl border text-sm ${theme.input}`}>Cancel</button>
            <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold">Add Person</button>
          </div>
        </div>
      )}

      {editPerson && (
        <div className={`${theme.card} border rounded-2xl p-5 shadow-sm border-cyan-500/30`}>
          <h3 className="text-sm font-semibold mb-4">Edit — {editPerson.name}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={ic} />
            </div>
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Mobile Number</label>
              <input value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} className={ic} />
            </div>
            <div className="col-span-2">
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Area Assigned</label>
              <input value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} className={ic} />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <label className={`text-sm ${theme.subtext}`}>Active</label>
              <button onClick={() => setForm(p => ({ ...p, active: !p.active }))}
                className={`w-10 h-5 rounded-full relative transition-colors ${form.active ? "bg-emerald-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.active ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setEditPerson(null)} className={`flex-1 py-2.5 rounded-xl border text-sm ${theme.input}`}>Cancel</button>
            <button onClick={handleUpdate} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold">Save Changes</button>
          </div>
        </div>
      )}

      {loading && <div className="text-center py-10 text-cyan-500 text-sm">Loading team...</div>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {persons.map(p => (
            <div key={p._id} className={`${theme.card} border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {p.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{p.name}</div>
                    <div className={`text-xs ${theme.subtext}`}>{p.email}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.active ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500"}`}>
                  {p.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {p.mobile && <div className="flex items-center gap-2"><span className={`text-xs ${theme.subtext}`}>📱</span><span className="text-xs">{p.mobile}</span></div>}
                {p.area && <div className="flex items-center gap-2"><span className={`text-xs ${theme.subtext}`}>📍</span><span className="text-xs">{p.area}</span></div>}
                <div className="flex items-center gap-2"><span className={`text-xs ${theme.subtext}`}>🎭</span><span className="text-xs capitalize">{p.role}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 py-2 rounded-xl bg-blue-500/10 text-blue-600 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-500/20 transition-colors">
                  <Icon name="edit" size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(p._id)} className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-red-500/20 transition-colors">
                  <Icon name="trash" size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
          {persons.length === 0 && (
            <div className={`col-span-3 text-center py-16 ${theme.subtext}`}>
              <div className="text-4xl mb-3">👥</div>
              <div className="text-sm font-medium mb-1">No delivery persons yet</div>
              <div className="text-xs">Click "Add Person" to add your first team member</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function ReportsPage({ theme, darkMode, deliveries }) {
  const maxRev = Math.max(...MONTHLY_REVENUE.map(m => m.revenue));
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue trend */}
        <div className={`${theme.card} border rounded-2xl p-5 shadow-sm`}>
          <h3 className="font-semibold text-sm mb-4">Revenue Trend</h3>
          <div className="flex items-end gap-3 h-32">
            {MONTHLY_REVENUE.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-blue-400"
                  style={{ height: `${(m.revenue / maxRev) * 100}%` }} />
                <div className={`text-xs ${theme.subtext}`} style={{fontSize:"9px"}}>{m.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery person */}
        <div className={`${theme.card} border rounded-2xl p-5 shadow-sm`}>
          <h3 className="font-semibold text-sm mb-4">Delivery Performance</h3>
          {[{ name: "Suresh Yadav", count: 142, revenue: 5840, rating: 98 }, { name: "Ramesh Kumar", count: 118, revenue: 4920, rating: 94 }, { name: "Mahesh Patel", count: 96, revenue: 4080, rating: 91 }].map((p, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{p.name[0]}</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold">{p.name}</span>
                  <span className={theme.subtext}>{p.count} deliveries</span>
                </div>
                <div className={`h-2 rounded-full ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400" style={{ width: `${p.rating}%` }} />
                </div>
              </div>
              <span className="text-xs font-bold text-violet-500">{p.rating}%</span>
            </div>
          ))}
        </div>

        {/* Inventory summary */}
        <div className={`${theme.card} border rounded-2xl p-5 shadow-sm`}>
          <h3 className="font-semibold text-sm mb-4">Inventory Summary</h3>
          {[{ label: "Procured", value: 500, color: "bg-blue-500" }, { label: "Delivered (Jan)", value: 356, color: "bg-cyan-500" }, { label: "Returned", value: 298, color: "bg-emerald-500" }, { label: "Damaged", value: 12, color: "bg-red-500" }].map((s, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
              <div className={`flex-1 text-xs ${theme.text}`}>{s.label}</div>
              <div className="text-xs font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Area-wise */}
        <div className={`${theme.card} border rounded-2xl p-5 shadow-sm`}>
          <h3 className="font-semibold text-sm mb-4">Area-wise Volume</h3>
          {[{ area: "Koramangala", cans: 85 }, { area: "HSR Layout", cans: 64 }, { area: "Indiranagar", cans: 72 }, { area: "Whitefield", cans: 48 }, { area: "BTM Layout", cans: 39 }].map((a, i) => (
            <div key={i} className="flex items-center gap-3 mb-2.5">
              <div className={`text-xs font-medium w-24 shrink-0 ${theme.subtext}`}>{a.area}</div>
              <div className={`flex-1 h-2 rounded-full ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${(a.cans/85)*100}%` }} />
              </div>
              <div className="text-xs font-bold w-8 text-right">{a.cans}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TENANTS (Superadmin) ──────────────────────────────────────────────────────
function TenantsPage({ theme, darkMode, notify, user, setUser }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
const [editTenant, setEditTenant] = useState(null);
const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', plan: 'basic' });
  const [form, setForm] = useState({
    tenantName: '', tenantEmail: '', tenantPhone: '',
    adminName: '', adminEmail: '', adminPassword: '', plan: 'basic'
  });

  const ic = `w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-cyan-500 ${theme.input}`;

  useEffect(() => { fetchTenants(); }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await getTenantsAPI();
      if (data.success) setTenants(data.tenants);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.tenantName || !form.adminEmail || !form.adminPassword)
      return notify("Tenant name, admin email and password required", "error");
    try {
      const data = await createTenantAPI(form);
      if (data.success) {
        notify("Tenant created successfully!");
        setShowForm(false);
        setForm({ tenantName: '', tenantEmail: '', tenantPhone: '', adminName: '', adminEmail: '', adminPassword: '', plan: 'basic' });
        fetchTenants();
      } else {
        notify(data.message || "Failed to create tenant", "error");
      }
    } catch { notify("Server error", "error"); }
  };

  const handleToggle = async (id, currentActive) => {
    try {
      const data = await toggleTenantAPI(id, !currentActive);
      if (data.success) {
        setTenants(prev => prev.map(t => t._id === id ? { ...t, active: !currentActive } : t));
        notify(`Tenant ${!currentActive ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch { notify("Server error", "error"); }
  };
  const openEdit = (t) => {
  setEditTenant(t);
  setEditForm({ name: t.name, phone: t.phone || '', address: t.address || '', plan: t.plan });
  setShowForm(false);
};

const handleUpdateTenant = async () => {
  try {
    const data = await updateTenantAPI(editTenant._id, editForm);
   if (data.success) {
  setTenants(prev => prev.map(t => t._id === editTenant._id ? { ...t, ...editForm } : t));
  notify("Tenant updated successfully!");
  setEditTenant(null);
  // Update localStorage so print reflects new details
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const updatedUser = {
    ...savedUser,
    tenantName: editForm.name,
    tenantPhone: editForm.phone,
    tenantAddress: editForm.address,
  };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  if (setUser) setUser(updatedUser);
}
    else {
      notify(data.message || "Failed", "error");
    }
  } catch { notify("Server error", "error"); }
};
  const activeTenants = tenants.filter(t => t.active).length;

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-base">All Tenants</h2>
          <p className={`text-xs ${theme.subtext}`}>{tenants.length} total • {activeTenants} active</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium shadow-md hover:opacity-90">
          <Icon name="plus" size={15} /> New Tenant
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className={`${theme.card} border rounded-2xl p-5 shadow-sm`}>
          <h3 className="text-sm font-semibold mb-4">Create New Tenant</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Business Name *</label>
              <input value={form.tenantName} onChange={e => setForm(p => ({ ...p, tenantName: e.target.value }))} className={ic} placeholder="AquaFresh Distributors" />
            </div>
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Business Email</label>
              <input value={form.tenantEmail} onChange={e => setForm(p => ({ ...p, tenantEmail: e.target.value }))} className={ic} placeholder="business@email.com" />
            </div>
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Phone</label>
              <input value={form.tenantPhone} onChange={e => setForm(p => ({ ...p, tenantPhone: e.target.value }))} className={ic} placeholder="9876543210" />
            </div>
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Plan</label>
              <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))} className={ic}>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className={`col-span-2 border-t pt-3 ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
              <p className={`text-xs font-semibold ${theme.subtext} mb-3`}>Admin Account</p>
            </div>
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Admin Name</label>
              <input value={form.adminName} onChange={e => setForm(p => ({ ...p, adminName: e.target.value }))} className={ic} placeholder="Admin Name" />
            </div>
            <div>
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Admin Email *</label>
              <input value={form.adminEmail} onChange={e => setForm(p => ({ ...p, adminEmail: e.target.value }))} className={ic} placeholder="admin@business.com" autoComplete="new-email" />
            </div>
            <div className="col-span-2">
              <label className={`text-xs ${theme.subtext} mb-1 block`}>Admin Password *</label>
              <input type="password" value={form.adminPassword} onChange={e => setForm(p => ({ ...p, adminPassword: e.target.value }))} className={ic} placeholder="Min 6 characters" autoComplete="new-password" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className={`flex-1 py-2.5 rounded-xl border text-sm ${theme.input}`}>Cancel</button>
            <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold">Create Tenant</button>
          </div>
        </div>
      )}
      
      {/* Edit Form */}
{editTenant && (
  <div className={`${theme.card} border rounded-2xl p-5 shadow-sm border-blue-500/30`}>
    <h3 className="text-sm font-semibold mb-4">Edit — {editTenant.name}</h3>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={`text-xs ${theme.subtext} mb-1 block`}>Business Name</label>
        <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
          className={ic} placeholder="Business Name" />
      </div>
      <div>
        <label className={`text-xs ${theme.subtext} mb-1 block`}>Email (readonly)</label>
        <input value={editTenant.email} readOnly
          className={`${ic} opacity-50 cursor-not-allowed`} />
      </div>
      <div>
        <label className={`text-xs ${theme.subtext} mb-1 block`}>Phone</label>
        <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
          className={ic} placeholder="Phone" />
      </div>
      <div>
        <label className={`text-xs ${theme.subtext} mb-1 block`}>Plan</label>
        <select value={editForm.plan} onChange={e => setEditForm(p => ({ ...p, plan: e.target.value }))}
          className={ic}>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>
      <div className="col-span-2">
        <label className={`text-xs ${theme.subtext} mb-1 block`}>Address</label>
        <input value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))}
          className={ic} placeholder="Business Address" />
      </div>
    </div>
    <div className="flex gap-3 mt-4">
      <button onClick={() => setEditTenant(null)}
        className={`flex-1 py-2.5 rounded-xl border text-sm ${theme.input}`}>Cancel</button>
      <button onClick={handleUpdateTenant}
        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold">
        Save Changes
      </button>
    </div>
  </div>
)}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tenants", value: tenants.length, color: "from-blue-500 to-cyan-500" },
          { label: "Active", value: activeTenants, color: "from-emerald-500 to-teal-500" },
          { label: "Inactive", value: tenants.length - activeTenants, color: "from-rose-500 to-red-500" },
          { label: "Total Customers", value: tenants.reduce((s, t) => s + (t.customerCount || 0), 0), color: "from-violet-500 to-purple-500" },
        ].map((s, i) => (
          <div key={i} className={`${theme.card} border rounded-2xl p-4 shadow-sm`}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
              <Icon name="reports" size={14} className="text-white" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className={`text-xs ${theme.subtext} mt-0.5`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && <div className="text-center py-10 text-cyan-500 text-sm">Loading tenants...</div>}

      {/* Tenant Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tenants.map(t => (
            <div key={t._id} className={`${theme.card} border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Icon name="droplet" size={20} className="text-white" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.active ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-400/10 text-gray-500"}`}>
                  {t.active ? "Active" : "Inactive"}
                </span>
              </div>
              <h3 className="font-bold text-sm mb-1">{t.name}</h3>
              <div className={`text-xs ${theme.subtext} capitalize mb-1`}>{t.plan} plan</div>
              <div className={`text-xs ${theme.subtext} mb-4`}>
                👤 {t.adminName || 'No admin'} • {t.adminEmail || ''}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className={`rounded-xl p-2.5 ${darkMode ? "bg-gray-800" : "bg-slate-50"}`}>
                  <div className="text-lg font-bold">{t.customerCount || 0}</div>
                  <div className={`text-xs ${theme.subtext}`}>Customers</div>
                </div>
                <div className={`rounded-xl p-2.5 ${darkMode ? "bg-gray-800" : "bg-slate-50"}`}>
                  <div className={`text-xs ${theme.subtext} mt-1`}>{new Date(t.createdAt).toLocaleDateString('en-IN')}</div>
                  <div className={`text-xs ${theme.subtext}`}>Created</div>
                </div>
              </div>
    <div className="flex gap-2">
  <button onClick={() => openEdit(t)}
    className="flex-1 py-2 rounded-xl text-xs font-semibold border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-colors">
    Edit
  </button>
  <button onClick={() => handleToggle(t._id, t.active)}
    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors
      ${t.active
        ? "border-red-500/30 text-red-500 hover:bg-red-500/10"
        : "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"}`}>
    {t.active ? "Deactivate" : "Activate"}
  </button>
</div>
            </div>
          ))}
          {tenants.length === 0 && (
            <div className={`col-span-3 text-center py-16 ${theme.subtext}`}>
              <div className="text-4xl mb-3">🏢</div>
              <div className="text-sm font-medium mb-1">No tenants yet</div>
              <div className="text-xs">Click "New Tenant" to create your first tenant</div>
            </div>
          )}
        </div>
      )}
    </div>
 );
}