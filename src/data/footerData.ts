import { paths } from "@/src/routes/mainRoutes";

export const FOOTER_NAV = [
  { label: "Main", href: paths.home },
  { label: "Work", href: paths.work },
  { label: "Demos", href: paths.demos },
  { label: "Chat App", href: paths.chat },
  { label: "Download CV", href: paths.resume },
];

export const FOOTER_CONTACT = [
  { label: "sevavetisyan97@gmail.com", href: "mailto:sevavetisyan97@gmail.com", external: false },
  { label: "+374 41 080497", href: "tel:+37441080497", external: false },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sevak-avetisyan-arm/", external: true },
  { label: "GitHub", href: "https://github.com/Sew-a", external: true },
];

export const FOOTER_BRAND = {
  logo: "</> Sevak Avetisyan",
};
