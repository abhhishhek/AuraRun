import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LayoutDashboard, Package, ShoppingBag, Tag, TrendingUp, ChevronRight, Layers, Megaphone, Users, Mail } from 'lucide-react';
import api from '../../utils/api';

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Layers },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  { to: '/admin/announcement', label: 'Announcement', icon: Megaphone },
  { to: '/admin/contacts', label: 'Contacts', icon: Mail },
  { to: '/admin/users', label: 'Users', icon: Users, adminOnly: true },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="admin-shell animate-fade-in">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <div className="admin-logo">∞</div>
            <div>
              <div className="admin-brand-title">Spodust</div>
              <div className="admin-brand-subtitle">Admin</div>
            </div>
          </div>
          <nav>
            {NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === 'admin').map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`admin-nav-item ${active ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminOverview() {
  const [stats, setStats] = useState({ orders: 0, products: 0, revenue: 0 });

  useEffect(() => {
    Promise.all([api.get('/orders?limit=1'), api.get('/products?limit=1')]).then(([orders, products]) => {
      setStats({
        orders: orders.data.total || 0,
        products: products.data.total || 0,
        revenue: 0,
      });
    });
  }, []);

  const cards = [
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'var(--accent)' },
    { label: 'Products', value: stats.products, icon: Package, color: '#3b82f6' },
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: '#10b981' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Dashboard</p>
          <h1 className="admin-page-title">Overview</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="admin-panel">
            <div className="admin-panel-body">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { to: '/admin/products', label: 'Manage Products', desc: 'Add, edit or remove products', icon: Package },
          { to: '/admin/categories', label: 'Manage Categories', desc: 'Create and organize categories', icon: Layers },
          { to: '/admin/orders', label: 'Manage Orders', desc: 'View and update order statuses', icon: ShoppingBag },
          { to: '/admin/coupons', label: 'Manage Coupons', desc: 'Create and manage discount codes', icon: Tag },
          { to: '/admin/contacts', label: 'Contact Requests', desc: 'Review and resolve support inquiries', icon: Mail },
        ].map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to} className="admin-panel admin-panel-body admin-quick-link">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent-subtle)' }}>
              <Icon size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
