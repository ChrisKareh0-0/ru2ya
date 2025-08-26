'use client';

export default function WhatsAppButton() {
  const phone = '9613774989';
  const message = encodeURIComponent('Hello Ruءya Eyewear, I have a question.');
  const href = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 mb-[env(safe-area-inset-bottom)] mr-[env(safe-area-inset-right)] z-50 group focus:outline-none"
    >
      <div className="flex items-center justify-center h-14 w-14 md:h-12 md:w-auto md:px-4 rounded-full bg-[#7C805A] text-white shadow-[0_10px_25px_rgba(0,0,0,0.25)] ring-1 ring-white/20 hover:shadow-[0_14px_30px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-0.5">
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7 md:w-6 md:h-6 fill-current">
          <path d="M20.52 3.48A11.94 11.94 0 0 0 12.01 0C5.38 0 .01 5.37.01 11.99c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.61a12 12 0 0 0 5.83 1.5h.01c6.62 0 11.99-5.37 11.99-12 0-3.2-1.25-6.21-3.49-8.41zM12.02 21.9h-.01a9.89 9.89 0 0 1-5.04-1.38l-.36-.21-3.67.96.98-3.58-.24-.37a9.91 9.91 0 0 1-1.53-5.31c0-5.47 4.45-9.92 9.93-9.92 2.65 0 5.14 1.03 7.01 2.9 1.87 1.87 2.9 4.36 2.9 7.01 0 5.47-4.45 9.9-9.97 9.9zm5.77-7.42c-.31-.15-1.83-.9-2.11-1-.28-.1-.49-.15-.69.15-.21.31-.78.99-.95 1.2-.17.21-.35.23-.64.08-.31-.15-1.3-.48-2.47-1.53-.91-.81-1.53-1.81-1.71-2.11-.18-.31-.02-.49.13-.64.13-.13.31-.35.46-.52.15-.17.21-.3.31-.49.1-.2.05-.36-.03-.51-.08-.15-.72-1.73-.98-2.37-.26-.62-.52-.53-.7-.54-.18-.01-.4-.02-.62-.02-.21 0-.55.08-.83.39-.28.31-1.09 1.06-1.09 2.58s1.12 2.99 1.27 3.19c.15.2 2.21 3.37 5.36 4.72.75.33 1.33.53 1.79.67.75.24 1.43.2 1.97.12.6-.09 1.83-.74 2.1-1.44.26-.69.26-1.35.18-1.5-.08-.16-.29-.24-.6-.39z"/>
        </svg>
        <span className="hidden md:inline ml-2 text-sm font-light tracking-wide leading-none">WhatsApp</span>
      </div>
    </a>
  );
}


