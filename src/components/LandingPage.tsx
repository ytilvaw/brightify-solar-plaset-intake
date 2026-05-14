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
        <div className="contact-links">
          <a className="email-link" href="mailto:info@brightifysolar.com">
            info@brightifysolar.com
          </a>
          <a
            aria-label="Message Brightify Solar on WhatsApp"
            className="whatsapp-link"
            href="https://wa.me/14084643739"
            rel="noreferrer"
            target="_blank"
          >
            <svg aria-hidden="true" viewBox="0 0 32 32">
              <path d="M16.04 4a11.89 11.89 0 0 0-10.2 18.03L4.5 28l6.08-1.59A11.94 11.94 0 1 0 16.04 4Zm0 21.86c-1.77 0-3.5-.47-5.01-1.37l-.36-.21-3.61.95.96-3.52-.24-.37a9.87 9.87 0 1 1 8.26 4.52Zm5.42-7.38c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.39-1.47-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>
      </section>
    </main>
  )
}
