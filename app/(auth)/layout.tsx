import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="pt-safe">
        <div className="mx-auto flex h-16 max-w-md items-center px-4">
          <Link href="/" aria-label="Coillector, inicio" className="rounded-lg">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-12">{children}</main>
    </div>
  );
}
