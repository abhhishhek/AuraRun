import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-text">
          <p className="about-kicker">Sustainability</p>
          <h1>Caring for every mile you take.</h1>
          <p className="about-lead">
            AuraRun blends everyday performance with mindful materials. We design
            shoes that move with you now and leave a lighter footprint later.
          </p>
          <p className="about-body">
            From breathable uppers to recycled cushioning, we refine each drop to
            balance comfort, durability, and responsibility. Our teams audit
            every collection and partner with vetted factories that meet strict
            environmental standards.
          </p>
          <div className="about-actions">
            <Link to="/products" className="btn-primary px-6 py-3">Explore the collection</Link>
            <Link to="/contact" className="btn-secondary px-6 py-3">Talk to us</Link>
          </div>
          <div className="about-highlights">
            {[
              { label: 'Low-impact materials', value: '68%' },
              { label: 'Certified factories', value: '42' },
              { label: 'Pairs recycled', value: '12K+' },
            ].map((item) => (
              <div key={item.label} className="about-highlight-card">
                <p className="about-highlight-value">{item.value}</p>
                <p className="about-highlight-label">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="about-hero-media">
          <img
            src="https://images.pexels.com/photos/4064790/pexels-photo-4064790.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Sustainable fashion"
          />
        </div>
      </section>

      <section className="about-values">
        <div className="about-values-header">
          <h2>What we stand for</h2>
          <p>
            Thoughtful sourcing, responsible production, and a community that
            runs toward progress.
          </p>
        </div>
        <div className="about-values-grid">
          {[
            { title: 'Design for longevity', desc: 'Premium cushioning and durable stitchwork built to last.' },
            { title: 'Planet-positive packaging', desc: '100% recycled boxes and minimal ink printing.' },
            { title: 'Transparent supply chain', desc: 'We publish factory audits and impact updates quarterly.' },
            { title: 'Community first', desc: 'Local run clubs, repair events, and donation drives.' },
          ].map((item) => (
            <div key={item.title} className="about-value-card">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
