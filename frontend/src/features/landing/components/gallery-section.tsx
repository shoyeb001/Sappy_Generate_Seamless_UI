const showcase = [
  {
    coord: "x:0 y:0",
    category: "Dashboard",
    name: "Quant Edge Pro",
    description: "A dense analytics dashboard with tables, filters, and KPIs.",
  },
  {
    coord: "x:520 y:0",
    category: "Mobile",
    name: "Voyage OS",
    description: "A travel companion app with itineraries and offline maps.",
  },
  {
    coord: "x:1040 y:0",
    category: "Commerce",
    name: "Apex Hardware",
    description: "A storefront with product grids, cart, and checkout flow.",
  },
]

export const GallerySection = () => (
  <section className="mx-auto max-w-5xl px-6 py-24">
    <span className="readout text-primary">the output</span>
    <h2 className="mt-3 font-semibold text-2xl tracking-tight">
      Built with Sappy
    </h2>
    <p className="mt-2 text-muted-foreground text-sm">
      A few examples of what a single prompt can produce.
    </p>

    <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
      {showcase.map((item) => (
        <div key={item.name} className="group bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="readout text-muted-foreground">
              {item.category}
            </span>
            <span className="readout text-muted-foreground/60 tracking-normal">
              {item.coord}
            </span>
          </div>
          <h3 className="mt-4 font-medium text-foreground">{item.name}</h3>
          <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  </section>
)
