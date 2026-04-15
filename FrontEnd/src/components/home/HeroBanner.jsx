import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

export default function HeroBanner({ banners }) {
  const prevRef = useRef(null)
  const nextRef = useRef(null)

  const slides = banners.length > 0 ? banners : [null]

  return (
    <section className="relative w-full overflow-hidden rounded-3xl mt-2" style={{ aspectRatio: '16/6.5', minHeight: 360 }}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true, el: '.hero-pagination' }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current
          swiper.params.navigation.nextEl = nextRef.current
        }}
        loop
        speed={900}
        className="w-full h-full"
      >
        {slides.map((b, i) => (
          <SwiperSlide key={b?._id ?? i}>
            {/* Background */}
            {b?.image?.url ? (
              <img
                src={b.image.url}
                alt={b.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-stone-800" />
            )}

            {/* Layered overlay: dark left side, fading right */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/5" />
            {/* Subtle bottom vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            {/* Decorative accent lines */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-amber-500 to-transparent opacity-60" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
                <div className="max-w-xl">
                  {/* Eyebrow tag */}
                  {(b?.subtitle || !b) && (
                    <div className="inline-flex items-center gap-2 mb-5">
                      <span className="w-8 h-px bg-amber-400" />
                      <span className="text-amber-400 text-xs font-semibold tracking-[0.25em] uppercase">
                        {b?.subtitle ?? 'Bộ sưu tập mới 2026'}
                      </span>
                    </div>
                  )}

                  {/* Heading */}
                  <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                    {b ? (
                      b.title
                    ) : (
                      <>Thời Trang<br /><span className="text-amber-400">Cao Cấp</span></>
                    )}
                  </h1>

                  {/* Sub-description (fallback only) */}
                  {!b && (
                    <p className="text-gray-300/80 mt-4 text-sm lg:text-base leading-relaxed max-w-sm">
                      Khám phá sự thanh lịch vượt thời gian với bộ sưu tập được chọn lọc.
                    </p>
                  )}

                  {/* CTA buttons */}
                  <div className="flex flex-wrap gap-3 mt-8">
                    <Link
                      to={b?.link ?? '/san-pham'}
                      className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-amber-500 text-white text-sm font-semibold rounded-full hover:bg-amber-400 transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-400/40 hover:scale-[1.03]"
                    >
                      Khám phá ngay
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    {!b && (
                      <Link
                        to="/san-pham?sort=-createdAt"
                        className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/40 text-white text-sm font-medium rounded-full hover:border-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                      >
                        Hàng mới về
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            ref={prevRef}
            className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/25 hover:border-white/40 transition-all duration-200 group"
            aria-label="Previous"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            ref={nextRef}
            className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/25 hover:border-white/40 transition-all duration-200 group"
            aria-label="Next"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Custom pagination */}
      <div className="hero-pagination absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 [&_.swiper-pagination-bullet]:w-6 [&_.swiper-pagination-bullet]:h-1 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-white/40 [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet-active]:bg-amber-400 [&_.swiper-pagination-bullet-active]:w-10 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet]:duration-300" />
    </section>
  )
}
