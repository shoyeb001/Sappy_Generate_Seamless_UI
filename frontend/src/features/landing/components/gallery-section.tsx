const showcase = [
  {
    category: "Dashboard",
    name: "Quant Edge Pro",
    description: "A dense analytics dashboard with tables, filters, and KPIs.",
  },
  {
    category: "Mobile",
    name: "Voyage OS",
    description: "A travel companion app with itineraries and offline maps.",
  },
  {
    category: "Commerce",
    name: "Apex Hardware",
    description: "A storefront with product grids, cart, and checkout flow.",
  },
]

export const GallerySection = () => (
  <section className="mx-auto max-w-5xl px-6 py-24">
    <h2 className="font-semibold text-2xl tracking-tight">Built with Sappy</h2>
    <p className="mt-2 text-muted-foreground text-sm">
      A few examples of what a single prompt can produce.
    </p>

    <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
      {showcase.map((item) => (
        <div key={item.name} className="bg-card p-6">
          <p className="text-muted-foreground text-xs uppercase tracking-widest">
            {item.category}
          </p>
          <h3 className="mt-3 font-medium text-foreground">{item.name}</h3>
          <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  </section>
)
