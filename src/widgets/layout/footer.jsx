export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-2">
      <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
        <ul className="flex items-center gap-4"></ul>
      </div>
    </footer>
  );
}

export default Footer;
