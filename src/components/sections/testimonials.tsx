'use client'

import { motion, useReducedMotion } from 'motion/react'

const testimonials = [
  {
    quote: 'My customers love checking their position in line. No more crowding the door.',
    name: 'Marcus Thompson',
    role: 'Owner, Sharp Edgez',
    avatar: 'MT',
  },
  {
    quote: 'Set it up in 5 minutes on my phone. Now I manage everything from the chair.',
    name: 'Andre Williams',
    role: 'Barber, The Blend',
    avatar: 'AW',
  },
  {
    quote: 'The portfolio feature alone brought me 3 new clients this week.',
    name: 'DeShawn Carter',
    role: 'Barber, Crown Cuts',
    avatar: 'DC',
  },
]

export function Testimonials() {
  const reduce = useReducedMotion()

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.name}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.5,
            delay: i * 0.08,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="rounded-2xl bg-[#141C18] border border-[#263329] p-6"
        >
          <p className="text-sm text-[#EFE9DA]/60 leading-relaxed mb-6">
            &ldquo;{t.quote}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#263329] flex items-center justify-center text-xs font-bold text-[#E8B547]">
              {t.avatar}
            </div>
            <div>
              <p className="text-sm font-medium text-[#EFE9DA]">{t.name}</p>
              <p className="text-xs text-[#EFE9DA]/40">{t.role}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
