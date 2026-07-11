import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Coins,
  FileText,
  MapPin,
  PlayCircle,
  Send,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export type DocNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: { title: string; href: string }[];
};

export const DOC_NAV: DocNavItem[] = [
  {
    title: "Acquire XLM & USDC",
    href: "/documentation/acquire-xlm-usdc",
    icon: Coins,
  },
  {
    title: "Authenticate with MoneyGram",
    href: "/documentation/authenticate-moneygram",
    icon: ShieldCheck,
  },
  {
    title: "Initiate Transaction",
    href: "/documentation/initiate-transaction",
    icon: PlayCircle,
    children: [
      {
        title: "Overview",
        href: "/documentation/initiate-transaction",
      },
      {
        title: "QRIS Deposit",
        href: "/documentation/deposit-qris",
      },
      {
        title: "Poll Transaction Status",
        href: "/documentation/poll-transaction-status",
      },
    ],
  },
  {
    title: "Passing Customer Info (SEP-9)",
    href: "/documentation/passing-customer-info",
    icon: UserCheck,
  },
  {
    title: "Listen for Close Notification",
    href: "/documentation/listen-close-notification",
    icon: Bell,
  },
  {
    title: "Send or Receive Funds",
    href: "/documentation/send-receive-funds",
    icon: Send,
  },
  {
    title: "Fetch Reference Number",
    href: "/documentation/fetch-reference-number",
    icon: FileText,
  },
  {
    title: "On Ramp Location Test Data",
    href: "/documentation/on-ramp-test-data",
    icon: MapPin,
  },
];

export function isDocNavActive(pathname: string, href: string) {
  if (href === "/documentation") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isDocNavGroupActive(pathname: string, item: DocNavItem) {
  if (isDocNavActive(pathname, item.href)) return true;
  return item.children?.some((child) => isDocNavActive(pathname, child.href)) ?? false;
}
