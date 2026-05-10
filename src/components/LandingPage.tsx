const products = [
  {
    badge: 'Off-grid kit',
    description: '9kW solar panels with 16kWh battery storage.',
    image: '/products/ruixu-9kw-offgrid-kit.jpg',
    name: 'RUIXU 9kW Off-Grid Solar DIY Kit',
    price: '$7,800',
  },
  {
    badge: 'Installed package',
    description: 'Tesla Powerwall 3 paired with a 6kW solar panel system.',
    image: '/products/tesla-powerwall-3-6kw.jpg',
    name: 'Tesla Powerwall 3 + 6kW Solar',
    price: '$19,900',
  },
  {
    badge: 'Battery + solar',
    description: 'Tesla Powerwall 3 with a 10kW solar panel system and 27kWh storage.',
    image: '/products/tesla-powerwall-3-10kw.jpg',
    name: 'Tesla Powerwall 3 + 10kW Solar',
    price: '$33,900',
  },
]

export default function LandingPage() {
  return (
    <main className="site-page">
      <header className="site-header">
        <a aria-label="Brightify Solar home" className="brand-link" href="/">
          <img alt="Brightify Solar" src="/brightify-logo.png" />
        </a>

        <nav aria-label="Primary navigation" className="site-nav">
          <a href="/">Home</a>
          <a href="/#shop">Shop</a>
          <a href="/roof">Roof</a>
          <a href="/planset">Planset</a>
          <a href="/#contact">Contact Us</a>
        </nav>
      </header>

      <section className="landing-hero" id="home">
        <div className="landing-hero-copy">
          <p className="eyebrow">Brightify Solar</p>
          <h1>Solar kits, batteries, and planset support for faster installs.</h1>
          <p>
            Shop practical solar packages, compare home battery options, and send project
            details when you are ready for planset design.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#shop">
              Shop Packages
            </a>
            <a className="secondary-action" href="/planset">
              Start Planset Intake
            </a>
          </div>
        </div>

        <div aria-label="Featured solar packages" className="hero-product-strip">
          {products.map((product) => (
            <img alt={product.name} key={product.name} src={product.image} />
          ))}
        </div>
      </section>

      <section className="shop-section" id="shop">
        <div className="section-heading">
          <p className="eyebrow">Shop</p>
          <h2>Featured solar packages</h2>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <div className="product-image-frame">
                <img alt={product.name} src={product.image} />
              </div>
              <div className="product-content">
                <p className="product-badge">{product.badge}</p>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-meta">
                  <span>{product.price}</span>
                  <a href="#contact">Contact Us</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <p className="eyebrow">Contact Us</p>
          <h2>Ready to talk solar?</h2>
        </div>
        <a className="email-link" href="mailto:info@brightifysolar.com">
          info@brightifysolar.com
        </a>
      </section>
    </main>
  )
}
