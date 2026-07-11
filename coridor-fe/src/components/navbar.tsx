"use client";

import { useIsTablet } from "../hooks/breakpoint";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";

type CenterItemKey = "home" | "documentation" | "github";

const GITBOOK_URL = "https://coridor.gitbook.io/";
const GITHUB_URL = "https://github.com/demigohu/coridor";

const CENTER_ITEMS: {
    key: CenterItemKey;
    href: string;
    label: string;
    title: string;
    description: string;
    external?: boolean;
}[] = [
        {
            key: "home",
            href: "/",
            label: "Home",
            title: "Home",
            description: "Welcome to the Coridor documentation. Here you will find all the information you need to get started with Coridor.",
        },
        {
            key: "documentation",
            href: GITBOOK_URL,
            label: "Documentation",
            title: "Documentation",
            description: "Learn how to use Coridor and build your own applications.",
            external: true,
        },
        {
            key: "github",
            href: GITHUB_URL,
            label: "GitHub",
            title: "GitHub",
            description: "View the Coridor GitHub repository.",
            external: true,
        }
    ];

function NavItemLink({
    item,
    className,
    onMouseEnter,
    onMouseLeave,
}: {
    item: (typeof CENTER_ITEMS)[number];
    className?: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}) {
    if (item.external) {
        return (
            <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {item.label}
            </a>
        );
    }

    return (
        <Link
            href={item.href}
            className={className}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {item.label}
        </Link>
    );
}

export default function Navbar() {
    const [isPastHero, setIsPastHero] = useState(false);
    const [activeItem, setActiveItem] = useState<CenterItemKey>("home");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const mobileMenuId = useId();
    const isTablet = useIsTablet();
    const pathname = usePathname();

    useEffect(() => {
        const sentinel = document.getElementById("hero-end");
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                // When the sentinel is not visible, we've scrolled past the hero.
                setIsPastHero(!entry.isIntersecting);
            },
            {
                root: null,
                threshold: 0,
            }
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, []);

    const activeData = CENTER_ITEMS.find((item) => item.key === activeItem)!;

    // const headerBgClass = mobileOpen
    //   ? "bg-black"
    //   : isPastHero
    //     ? "bg-black"
    //     : "bg-transparent";

    return (
        <>
            {isTablet ? (
                <header
                    className={cn(`fixed inset-x-0 top-0 z-20 bg-white m-4 rounded-md`)}
                >
                    <div className="mx-auto flex flex-col items-center justify-between px-5  py-5">
                        {/* Left: Brand */}
                        <div className="flex items-center justify-between w-full">
                            <Link href="/" className="flex items-center gap-2">
                                <Image src="/logo/coridor.svg" alt="Coridor" width={24} height={24} />
                                <span className="text-2xl font-medium text-black font-wallpoet tracking-wide">
                                    CORIDOR
                                </span>
                            </Link>

                            <button
                                type="button"
                                className="relative cursor-pointer inline-flex items-center justify-center lg:hidden"
                                aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
                                aria-controls={mobileMenuId}
                                aria-expanded={mobileOpen}
                                onClick={() => setMobileOpen((v) => !v)}
                            >
                                <Menu
                                    className={cn(
                                        "h-6 w-6 transition-all duration-300 absolute text-black",
                                        mobileOpen ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"
                                    )}
                                    aria-hidden="true"
                                />
                                <X
                                    className={cn(
                                        "h-6 w-6 transition-all duration-300 text-black",
                                        mobileOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"
                                    )}
                                    aria-hidden="true"
                                />
                            </button>

                        </div>

                        {/* Mobile Menu */}
                        <div
                            id={mobileMenuId}
                            className={cn(
                                "w-full overflow-hidden transition-all duration-300 ease-out",
                                mobileOpen
                                    ? "max-h-96 opacity-100"
                                    : "max-h-0 opacity-0 pointer-events-none",
                            )}
                        >
                            <div
                                className={cn(
                                    "transition-transform duration-300 ease-out mt-4",
                                    mobileOpen ? "translate-y-0" : "-translate-y-2"
                                )}
                            >
                                <nav className="flex flex-col gap-4">
                                    {CENTER_ITEMS.map((item) => (
                                        <NavItemLink
                                            key={item.key}
                                            item={item}
                                            className="text-[15px] font-bold transition-colors text-black text-center"
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                </header>
            ) : (
                <header
                    className={cn(`fixed inset-x-0 top-0 z-20 bg-transparent`)}
                >
                    <div className="mx-auto flex items-center justify-center px-5 md:px-10 py-5">
                        {/* Center: pill navigation with dropdown */}
                        <div
                            className="relative bg-[#F3F4F6] rounded-md flex items-center gap-20 p-4"
                            // onMouseEnter={() => setDropdownOpen(true)}
                            // onMouseLeave={() => setDropdownOpen(false)}
                        >
                            <Link href="/" className="flex items-center gap-2">
                                <Image src="/logo/coridor.svg" alt="Coridor" width={24} height={24} />
                                <span className="text-2xl font-medium text-black font-wallpoet tracking-wide">
                                    CORIDOR
                                </span>
                            </Link>

                            <nav className="flex items-center gap-4 rounded h-9 text-sm text-[#171717] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                                {CENTER_ITEMS.map((item) => (
                                    <NavItemLink
                                        key={item.key}
                                        item={item}
                                        className="relative font-semibold px-1 py-0.5 transition hover:font-bold hover:animate-pulse hover:bg-gradient-to-r hover:from-blue-600 hover:to-black hover:bg-clip-text hover:text-transparent"
                                        onMouseEnter={() => {
                                            setActiveItem(item.key);
                                            setDropdownOpen(true);
                                        }}
                                        onMouseLeave={() => setDropdownOpen(false)}
                                    />
                                ))}
                            </nav>

                            {dropdownOpen && (
                                <div className="absolute left-0 top-full mt-2 w-full rounded bg-[#F3F4F6] p-5 text-sm text-[#171717] shadow-[0_18px_45px_rgba(0,0,0,0.55)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                                    <div className="mb-2 text-base font-semibold text-[#171717]">
                                        {activeData.title}
                                    </div>
                                    <p className="text-xs leading-relaxed text-zinc-600">
                                        {activeData.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
            )}
        </>

    );
}

