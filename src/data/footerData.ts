import { paths } from "@/src/routes/mainRoutes";

export const FOOTER_NAV = [
  { label: "Home", href: paths.home },
  { label: "Work", href: paths.work },
  { label: "Demos", href: paths.demos },
  { label: "Résumé", href: paths.resume },
];

export const FOOTER_CONTACT = [
  { label: "sevavetisyan97@gmail.com", href: "mailto:sevavetisyan97@gmail.com", external: false },
  { label: "(+374) 41 080 497", href: "tel:+37441080497", external: false },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sevak-avetisyan-6122411b2/", external: true },
  { label: "Instagram", href: "https://www.instagram.com/sew_rem?igsh=d294MHpybDF5N2V1", external: true },
];

export const FOOTER_BRAND = {
  logo: "</> Sevak Avetisyan",
};
