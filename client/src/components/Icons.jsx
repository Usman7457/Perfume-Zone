const P = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const SearchIcon = (props) => <svg {...P} {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const UserIcon = (props) => <svg {...P} {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>;
export const BagIcon = (props) => <svg {...P} {...props}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>;
export const MenuIcon = (props) => <svg {...P} {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
export const CloseIcon = (props) => <svg {...P} {...props}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const PinIcon = (props) => <svg {...P} {...props}><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
export const HeartIcon = ({ filled, ...props }) => (
  <svg {...P} fill={filled ? 'currentColor' : 'none'} {...props}>
    <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
  </svg>
);
export const TrashIcon = (props) => (
  <svg {...P} {...props}><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></svg>
);
export const CheckIcon = (props) => (
  <svg {...P} {...props}><polyline points="20 6 9 17 4 12" /></svg>
);
export const LockIcon = (props) => (
  <svg {...P} {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
export const UploadIcon = (props) => (
  <svg {...P} {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
export const TruckIcon = (props) => (
  <svg {...P} {...props}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
);
export const ShieldIcon = (props) => (
  <svg {...P} {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
