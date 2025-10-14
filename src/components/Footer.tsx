export default function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container py-6">
        <p className="text-center text-sm text-muted-foreground">
          {new Date().getFullYear()} M Alam - Solace Candidate Assignment
        </p>
      </div>
    </footer>
  );
}
