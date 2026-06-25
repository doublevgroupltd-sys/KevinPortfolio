import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-display-1 font-semibold">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="mt-8 inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground">
        Back to home
      </Link>
    </div>
  );
}
