import { useEffect, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { BookOpen, X } from "lucide-react";
import { Link } from "react-router-dom";

const MotionPopup = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 12000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible ? (
        <Motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 z-50 w-[min(95vw,420px)] -translate-x-1/2 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="badge badge-info uppercase tracking-[0.18em]">
                  New
                </span>
                <h3 className="text-base font-semibold text-slate-950">
                  Need a quick start?
                </h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Explore the onboarding guide after login to learn how Aidela
                helps candidates and employers move faster.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="btn btn-primary rounded-full text-sm">
                  Learn more
                </Link>
                <button
                  type="button"
                  onClick={() => setIsVisible(false)}
                  className="btn btn-secondary rounded-full text-sm">
                  Dismiss
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="text-slate-400 transition hover:text-slate-700"
              aria-label="Close popup">
              <X className="h-5 w-5" />
            </button>
          </div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default MotionPopup;
