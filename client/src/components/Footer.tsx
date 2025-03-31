export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-neutral-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-neutral-500">
            &copy; {currentYear} OT Attack Simulation & Mitigation System
          </div>
          <div className="text-sm text-neutral-500">
            Version 1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
}
