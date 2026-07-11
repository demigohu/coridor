import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Footer() {
    return (
        <footer className='bg-black p-4'>
            <div className='bg-white p-5 rounded-md flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0'>
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo/coridor.svg" alt="Coridor" width={24} height={24} />
                    <span className="text-2xl font-medium text-black font-wallpoet tracking-wide">
                        CORIDOR
                    </span>
                </Link>
                <p className="text-sm text-muted-foreground text-center">© 2026 Coridor. All rights reserved.</p>
            </div>
        </footer>
    )
}
