export default function StatsCard({ label, value, icon: Icon, color, subtext }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>{value}</p>
      {subtext && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtext}</p>}
    </div>
  );
}
