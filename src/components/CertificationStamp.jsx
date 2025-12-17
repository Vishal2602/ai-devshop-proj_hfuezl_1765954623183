import { motion } from 'framer-motion';
import './CertificationStamp.css';

export default function CertificationStamp({ certification, delay = 0 }) {
  return (
    <motion.div
      className="certification-stamp"
      initial={{ scale: 0, opacity: 0, rotate: -12 }}
      animate={{ scale: 1, opacity: 1, rotate: -3 }}
      transition={{
        delay: delay / 1000,
        type: 'spring',
        stiffness: 300,
        damping: 15
      }}
    >
      <div className="certification-stamp__inner">
        <span className="certification-stamp__label">Certified</span>
        <span className="certification-stamp__title">{certification.replace('Certified ', '')}</span>
        <div className="certification-stamp__stars">
          {[...Array(5)].map((_, i) => (
            <svg key={i} viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 10.91,8.26" />
            </svg>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
