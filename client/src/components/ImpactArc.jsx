import { motion } from "framer-motion";

/**
 * The Impact Arc — the platform's one recurring signature: a shot's flight
 * path rendered as a glowing gradient line that lands as a point of light.
 * Reused (in different sizes/variants) across the login hero, the loading
 * screen spinner, and success confirmations, so the whole auth system reads
 * as one visual idea instead of a stock golf illustration bolted onto forms.
 */
export default function ImpactArc({ variant = "hero", className = "" }) {
  if (variant === "spinner") {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="arcSpin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#arcSpin)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="70 180"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
          style={{ transformOrigin: "50px 50px" }}
        />
      </svg>
    );
  }

  if (variant === "success") {
    return (
      <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="arcSuccess" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="url(#arcSuccess)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        <motion.path
          d="M38 62 L53 77 L84 44"
          fill="none"
          stroke="url(#arcSuccess)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
        />
      </svg>
    );
  }

  // hero variant — the flight path illustration for the Login/Register split panel
  return (
    <svg viewBox="0 0 480 380" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="arcHero" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#065F46" />
          <stop offset="55%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <radialGradient id="arcGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ground line */}
      <line x1="40" y1="330" x2="440" y2="330" stroke="#065F46" strokeOpacity="0.15" strokeWidth="2" />

      {/* the arc itself */}
      <motion.path
        d="M70 320 C 140 120, 300 80, 420 90"
        fill="none"
        stroke="url(#arcHero)"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />

      {/* origin point */}
      <circle cx="70" cy="320" r="6" fill="#065F46" />

      {/* landing glow */}
      <circle cx="420" cy="90" r="28" fill="url(#arcGlow)" />
      <motion.circle
        cx="420"
        cy="90"
        r="7"
        fill="#D4AF37"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.6, duration: 0.4, ease: "backOut" }}
      />

      {/* orbiting dot travels the path, echoing "progress toward impact" */}
      <motion.circle
        r="5"
        fill="#ffffff"
        stroke="#10B981"
        strokeWidth="2"
        animate={{
          offsetDistance: ["0%", "100%"],
        }}
        style={{ offsetPath: "path('M70 320 C 140 120, 300 80, 420 90')" }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
      />
    </svg>
  );
}
