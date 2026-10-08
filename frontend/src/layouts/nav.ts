import { Activity, AlertTriangle, BarChart3, BookOpen, BrainCircuit, FlaskConical, LayoutDashboard, LifeBuoy, Server, Settings, Wrench, type LucideIcon } from 'lucide-react';

export interface NavItem { to: string; label: string; icon: LucideIcon; short?: string }

export const mainNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/infrastructure', label: 'Infrastructure', icon: Server, short: 'Infra' },
  { to: '/predictions', label: 'Predictions', icon: BrainCircuit },
  { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { to: '/recovery', label: 'Recovery Actions', icon: Wrench, short: 'Recovery' },
  { to: '/experiments', label: 'Experiments', icon: FlaskConical },
  { to: '/metrics', label: 'Metrics & Reports', icon: BarChart3, short: 'Metrics' },
];

export const systemNav: NavItem[] = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help & Documentation', icon: LifeBuoy },
];

/** Shown in the mobile bottom bar; everything else is reachable through "More". */
export const bottomNav: NavItem[] = [mainNav[0], mainNav[2], mainNav[3], mainNav[4]];

export const allNav = [...mainNav, ...systemNav, { to: '/notifications', label: 'Notifications', icon: Activity }, { to: '/profile', label: 'Profile', icon: BookOpen }];
