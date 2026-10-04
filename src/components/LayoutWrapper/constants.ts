import { paths } from "@/src/routes/mainRoutes";

/** Routes (and their nested paths) where the fixed animated character is hidden. */
export const CHARACTER_HIDDEN_ROUTES = [paths.demos, paths.chat];

export const pageTransition = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(4px)" },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
};