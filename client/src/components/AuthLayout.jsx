import { motion } from "framer-motion";
import FloatingBlobs from "../components/FloatingBobs.jsx"
import ImpactArc from "./ImpactArc.jsx";

/**
 * Two modes:
 *  - split: full left illustration panel + right form panel (Login/Register)
 *  - centered: single centered glass card (Forgot/Reset/OTP/Verify/etc.)
 */
export default function AuthLayout({
  children,
  mode = "centered",
  eyebrow = "Fairway & Fund",
  headline = "Play golf. Change lives.",
  subline = "Track your scores. Win monthly prizes. Support charities.",
}) {
  if (mode === "split") {
    return (
      <div className="relative min-h-screen w-full bg-ivory overflow-hidden">
        <FloatingBlobs />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row items-stretch">
          {/* Left — narrative panel */}
          <div className="hidden lg:flex flex-1 flex-col justify-between px-14 py-12">
            <span className="eyebrow-gold w-fit">{eyebrow}</span>

            <div>
              <ImpactArc variant="hero" className="w-full max-w-lg" />
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-4 text-5xl font-medium leading-[1.08] text-ink"
              >
                {headline}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted"
              >
                {subline}
              </motion.p>
            </div>

            <p className="text-xs text-muted/70">
              © {new Date().getFullYear()} Fairway & Fund. Every round played funds a cause.
            </p>
          </div>

          {/* Right — form panel */}
          <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-14">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="glass-card w-full max-w-md p-8 sm:p-10"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ivory px-4 py-10">
      <FloatingBlobs />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card relative z-10 w-full max-w-md p-8 sm:p-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
