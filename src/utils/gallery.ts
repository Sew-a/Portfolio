export interface GalleryImage {
  id: string;
  src: string;
  title: string;
  category: string;
  width: number;
  height: number;
}

export function getGalleryImages(): GalleryImage[] {
  return [
    { id: '1', src: 'https://res.cloudinary.com/dlggumsot/image/upload/v1779292519/MyProject1_ejkm8z.png', title: 'Editor Project', category: 'Work', width: 600, height: 400 },
    { id: '6', src: 'https://res.cloudinary.com/dlggumsot/image/upload/v1779292519/MyProject6_xzhrew.png', title: 'Brandkit', category: 'Work', width: 600, height: 400 },
    { id: '3', src: 'https://res.cloudinary.com/dlggumsot/image/upload/v1779292518/MyProject3_yzfsbw.png', title: 'Files System', category: 'Cloud Project', width: 600, height: 400 },
    { id: '2', src: 'https://res.cloudinary.com/dlggumsot/image/upload/v1779292516/MyProject2_dvlxy8.png', title: 'Google Picker', category: 'Work', width: 600, height: 400 },
    { id: '5', src: 'https://res.cloudinary.com/dlggumsot/image/upload/v1779292519/MyProject5_hyiqt1.png', title: 'File Action', category: 'Work', width: 600, height: 400 },
    { id: '14', src: 'https://res.cloudinary.com/dlggumsot/image/upload/v1791109632/Screenshot_2026-10-04_142652_z1ocpl.webp', title: 'Micro Canvas', category: 'Work', width: 600, height: 400 },
    { id: '9', src: 'https://res.cloudinary.com/dlggumsot/image/upload/v1782209157/IMG20260616175745_nlv53i.webp', title: 'My Artwork', category: 'Work', width: 600, height: 400 },
    { id: '11', src: 'https://res.cloudinary.com/dlggumsot/image/upload/v1783354442/Screenshot_2026-07-06_193857_ubcvpw.webp', title: 'AI Agents Website', category: 'AI', width: 600, height: 400 },
    { id: '12', src: 'https://res.cloudinary.com/dlggumsot/image/upload/v1783354442/Screenshot_2026-07-06_193842_qqp0jb.webp', title: 'AI Agents Wesite prompts', category: 'AI', width: 600, height: 400 },
    { id: '4', src: 'https://res.cloudinary.com/dlggumsot/image/upload/v1791109631/Screenshot_2026-10-04_141901_kuedn4.webp', title: 'Group Chat', category: 'Work', width: 600, height: 400 },
  ];
}