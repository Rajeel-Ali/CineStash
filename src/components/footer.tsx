import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/50">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} CineStash. A project by{' '}
          <Link
            href="https://proprofile.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            ProProfile
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
