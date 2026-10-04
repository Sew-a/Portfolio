import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DemosIntro from "../DemosIntro/DemosIntro";
import CanvasMiniapp from "../CanvasMiniapp/CanvasMiniapp";
import ChatDemo from "../ChatDemo/ChatDemo";

const BANNER_EXIT = {
  opacity: 0,
  scale: 0.98,
};

const MINIAPP_ENTRY = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

export default function DemosExperience() {
  const [miniappOpen, setMiniAppOpen] = useState(false);

  return (
    <AnimatePresence>
      {!miniappOpen && (
        <motion.section
          key="chat-demo"
          className="demos-page__banner demos-page__banner--chat"
          exit={BANNER_EXIT}
          transition={{ duration: 0.3 }}
        >
          <ChatDemo />
        </motion.section>
      )}
      {!miniappOpen && (
        <motion.section
          key="canvas-intro"
          className="demos-page__banner"
          exit={BANNER_EXIT}
          transition={{ duration: 0.3 }}
        >
          <DemosIntro onOpen={() => setMiniAppOpen(true)} />
        </motion.section>
      )}
      {miniappOpen && (
        <motion.section
          key="canvas-miniapp"
          className="demos-page__miniapp"
          {...MINIAPP_ENTRY}
        >
          <CanvasMiniapp />
        </motion.section>
      )}
    </AnimatePresence>
  );
}
