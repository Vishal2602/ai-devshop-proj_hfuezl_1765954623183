/**
 * Confetti - Celebration animation for successful export
 *
 * Creates particle burst effect using Framer Motion
 */

import { motion } from 'framer-motion';
import { confettiParticle } from '../lib/animations';
import './Confetti.css';

const PARTICLE_COLORS = [
  'var(--color-primary)',
  'var(--color-gold)',
  'var(--color-rose)',
  'var(--color-sage)',
  'var(--color-ocean)',
];

const PARTICLE_COUNT = 12;

export default function Confetti() {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => i);

  return (
    <motion.div
      className="confetti"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {particles.map((index) => {
        const animation = confettiParticle(index);
        return (
          <motion.div
            key={index}
            className="confetti__particle"
            style={{
              backgroundColor: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
            }}
            initial={animation.initial}
            animate={animation.animate}
          />
        );
      })}
    </motion.div>
  );
}
