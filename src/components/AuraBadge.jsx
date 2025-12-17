import { motion } from 'framer-motion';
import './AuraBadge.css';

const auraStyles = {
  'Focus Goblin': { gradient: 'linear-gradient(135deg, #68D391 0%, #48BB78 100%)', emoji: '' },
  'Deadline Phantom': { gradient: 'linear-gradient(135deg, #ED64A6 0%, #D53F8C 100%)', emoji: '' },
  'Meeting Magnet': { gradient: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)', emoji: '' },
  'Inbox Specter': { gradient: 'linear-gradient(135deg, #F6AD55 0%, #ED8936 100%)', emoji: '' },
  'Revision Wraith': { gradient: 'linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)', emoji: '' },
  'Approval Seeker': { gradient: 'linear-gradient(135deg, #FBD38D 0%, #F6AD55 100%)', emoji: '' },
  'Scope Creeper': { gradient: 'linear-gradient(135deg, #FC8181 0%, #F56565 100%)', emoji: '' },
  'Format Warrior': { gradient: 'linear-gradient(135deg, #63B3ED 0%, #4299E1 100%)', emoji: '' }
};

export default function AuraBadge({ aura, delay = 0 }) {
  const style = auraStyles[aura] || auraStyles['Focus Goblin'];

  return (
    <motion.div
      className="aura-badge"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: delay / 1000,
        type: 'spring',
        stiffness: 400,
        damping: 10
      }}
      style={{ background: style.gradient }}
    >
      <span className="aura-badge__sparkle">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L13.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L10.91 8.26L12 2Z" />
        </svg>
      </span>
      <span className="aura-badge__text">{aura}</span>
    </motion.div>
  );
}
