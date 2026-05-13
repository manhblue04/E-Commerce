import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    label: 'Chất lượng cao cấp',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    ),
    label: 'Miễn phí vận chuyển',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    label: 'Đổi trả 30 ngày',
  },
]

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-gray-950 py-20 lg:py-28 rounded-3xl mx-4 lg:mx-8">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-600/8 blur-3xl" />
      {/* Grid lines texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

          {/* Left — copy */}
          <div className="text-center lg:text-left max-w-lg">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="w-6 h-px bg-amber-500" />
              <span className="text-amber-500 text-xs font-semibold tracking-[0.25em] uppercase">Bộ sưu tập mới nhất</span>
              <span className="w-6 h-px bg-amber-500" />
            </div>

            <h2 className="text-3xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
              Phong cách<br />
              <span className="relative inline-block">
                <span className="relative z-10 text-amber-400">Đẳng cấp</span>
                {/* Underline accent */}
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-500/50 rounded-full" />
              </span>
            </h2>
            <p className="text-gray-400 mt-5 text-sm lg:text-base leading-relaxed">
              Nâng tầm phong cách với những sản phẩm thời trang cao cấp,<br className="hidden lg:block" />
              tạo nên dấu ấn riêng biệt và ấn tượng.
            </p>

            <Link
              to="/san-pham"
              className="group inline-flex items-center gap-2.5 mt-8 px-8 py-4 bg-amber-500 text-white text-sm font-semibold rounded-full hover:bg-amber-400 transition-all duration-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-400/35 hover:scale-[1.03]"
            >
              Khám phá bộ sưu tập
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right — feature cards */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full lg:w-auto">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  {f.icon}
                </span>
                <span className="text-sm font-medium text-gray-200">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
