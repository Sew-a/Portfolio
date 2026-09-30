import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/src/components/Header";
import FollowSection from "@/src/components/FollowSection";
import Footer from "@/src/components/Footer";
import FixedCharacter from "@/src/components/FixedCharacter";
import { AuthModal } from "@/src/components/Auth";
import { useScrollToTop } from "@/src/hooks/useScrollToTop";
import { useThemeSync } from "@/src/hooks/useThemeSync";
import { useAuthSession } from "@/src/hooks/useAuthSession";
import { useAuthStore } from "@/src/store/useAuthStore";
import { pageTransition } from "./constants";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();

  const isAuthModalOpen = useAuthStore((s) => s.isAuthModalOpen);

  useScrollToTop();
  useThemeSync();
  useAuthSession();

  return (
    <div className="main-theme-wrapper">
      <Header />
      <div className="main">
        <div className="main-content">
          <div className="page-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={pageTransition.initial}
                animate={pageTransition.animate}
                exit={pageTransition.exit}
                transition={pageTransition.transition}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <FollowSection />
          <Footer />
        </div>
      </div>
      <FixedCharacter />
      <AnimatePresence>{isAuthModalOpen && <AuthModal />}</AnimatePresence>
    </div>
  );
}