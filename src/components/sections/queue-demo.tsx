'use client'

import { motion, useReducedMotion } from 'motion/react'

const queue = [
  { name: 'Rahul S.', service: 'Haircut', position: 1, status: 'next' },
  { name: 'Priya K.', service: 'Beard Trim', position: 2, status: 'waiting' },
  { name: 'Amit M.', service: 'Classic Cut', position: 3, status: 'waiting' },
  { name: 'Neha P.', service: 'Hair Color', position: 4, status: 'waiting' },
]

const statusColors = {
  next: 'bg-[#E8B547] text-[#0A0F0D]',
  waiting: 'bg-[#263329] text-[#EFE9DA]/60',
}

export function QueueDemo() {
  const reduce = useReducedMotion()

  return (
    <div className="max-w-lg mx-auto rounded-2xl bg-[#0A0F0D] border border-[#263329] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#263329] flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#EFE9DA]">Your Shop Name</p>
          <p className="text-xs text-[#EFE9DA]/40 font-mono mt-0.5">4 in queue · ~25 min wait</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-500 font-mono">LIVE</span>
        </div>
      </div>

      {/* Queue items */}
      <div className="divide-y divide-[#263329]">
        {queue.map((item, i) => (
          <motion.div
            key={item.name}
            initial={reduce ? false : { opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.4,
              delay: i * 0.08,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="px-5 py-3.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${statusColors[item.status as keyof typeof statusColors]}`}>
                {item.position}
              </div>
              <div>
                <p className="text-sm font-medium text-[#EFE9DA]">{item.name}</p>
                <p className="text-xs text-[#EFE9DA]/40">{item.service}</p>
              </div>
            </div>
            <span className={`text-xs font-mono ${item.status === 'next' ? 'text-[#E8B547]' : 'text-[#EFE9DA]/30'}`}>
              {item.status === 'next' ? 'NEXT' : `~${item.position * 12}m`}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-4 border-t border-[#263329]">
        <button className="w-full py-2.5 rounded-lg bg-[#E8B547] text-[#0A0F0D] text-sm font-semibold hover:bg-[#E8B547]/90 transition-colors duration-200">
          Join Queue
        </button>
      </div>
    </div>
  )
}
