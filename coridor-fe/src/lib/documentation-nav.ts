import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BookOpen,
  Braces,
  Coins,
  HelpCircle,
  KeyRound,
  PlayCircle,
  Send,
  ShieldCheck,
} from "lucide-react";

export type DocNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: { title: string; href: string }[];
};

/** Matches coridor/docs/site-map.md — wire to GitBook or in-app /docs routes. */
export const DOC_NAV: DocNavItem[] = [
  {
    title: "Getting started",
    href: "/docs/start",
    icon: BookOpen,
  },
  {
    title: "Deposit IDR → USDC",
    href: "/docs/deposit",
    icon: ArrowDownToLine,
  },
  {
    title: "Withdraw USDC → IDR",
    href: "/docs/withdraw",
    icon: ArrowUpFromLine,
  },
  {
    title: "FAQ",
    href: "/docs/faq",
    icon: HelpCircle,
  },
  {
    title: "Integrate Coridor",
    href: "/docs/developers/integrate",
    icon: Braces,
    children: [
      { title: "Overview", href: "/docs/developers/integrate" },
      { title: "Acquire USDC", href: "/docs/developers/acquire-usdc" },
      { title: "Authenticate (SEP-10)", href: "/docs/developers/authenticate" },
      { title: "Initiate transaction", href: "/docs/developers/initiate-transaction" },
    ],
  },
  {
    title: "Authenticate (SEP-10)",
    href: "/docs/developers/authenticate",
    icon: ShieldCheck,
  },
  {
    title: "Initiate transaction (SEP-24)",
    href: "/docs/developers/initiate-transaction",
    icon: PlayCircle,
  },
  {
    title: "Send or receive USDC",
    href: "/docs/developers/send-receive-funds",
    icon: Send,
  },
  {
    title: "Poll transaction status",
    href: "/docs/developers/poll-status",
    icon: Coins,
  },
  {
    title: "stellar.toml & SEP",
    href: "/docs/developers/stellar",
    icon: KeyRound,
  },
];

export function isDocNavActive(pathname: string, href: string) {
  if (href === "/docs") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isDocNavGroupActive(pathname: string, item: DocNavItem) {
  if (isDocNavActive(pathname, item.href)) return true;
  return item.children?.some((child) => isDocNavActive(pathname, child.href)) ?? false;
}
