declare module 'lucide-react' {
  import * as React from 'react';

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<LucideProps> & React.RefAttributes<SVGSVGElement>
  >;

  export type Icon = LucideIcon;

  export const LayoutDashboard: LucideIcon;
  export const Landmark: LucideIcon;
  export const Users: LucideIcon;
  export const Library: LucideIcon;
  export const ChartNoAxesColumn: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Activity: LucideIcon;
  export const Coins: LucideIcon;
  export const Split: LucideIcon;
  export const ScrollText: LucideIcon;
  export const Menu: LucideIcon;
  export const X: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowDown: LucideIcon;
  export const ArrowUp: LucideIcon;
  export const Play: LucideIcon;
  export const Pause: LucideIcon;
  export const Calendar: LucideIcon;
  export const Bell: LucideIcon;
  export const User: LucideIcon;
  export const LogOut: LucideIcon;
  export const Search: LucideIcon;
  export const SlidersHorizontal: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Clock: LucideIcon;
  export const Lock: LucideIcon;
  export const Key: LucideIcon;
  export const KeyRound: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Terminal: LucideIcon;
  export const AtSign: LucideIcon;
  export const Gavel: LucideIcon;
  export const School: LucideIcon;
  export const BookOpen: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const Cpu: LucideIcon;
  export const Server: LucideIcon;
  export const HardDrive: LucideIcon;
  export const Filter: LucideIcon;
  export const Upload: LucideIcon;
  export const FileText: LucideIcon;
  export const Layers: LucideIcon;
  export const Settings: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const Shield: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Plus: LucideIcon;
  export const Trash2: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Download: LucideIcon;
  export const LogIn: LucideIcon;
  export const CloudOff: LucideIcon;
  export const Timer: LucideIcon;
  export const ShieldX: LucideIcon;
  export const Laptop: LucideIcon;
  export const Smartphone: LucideIcon;
  export const Monitor: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Compass: LucideIcon;
  export const Database: LucideIcon;
  export const Network: LucideIcon;
  export const Radio: LucideIcon;
  export const PanelLeftClose: LucideIcon;
  export const PanelLeftOpen: LucideIcon;
  export const Sliders: LucideIcon;
  export const Workflow: LucideIcon;
  export const FileSpreadsheet: LucideIcon;
  export const CalendarDays: LucideIcon;
  export const UserCheck: LucideIcon;
  export const UserX: LucideIcon;
  export const ShieldQuestion: LucideIcon;
  export const Copy: LucideIcon;
  export const Edit: LucideIcon;
}
