'use client';

export default function WhatsAppButton() {
  const phone = '96176829297';
  const message = encodeURIComponent('Hello Ruءya Eyewear, I have a question.');
  const href = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 mb-[env(safe-area-inset-bottom)] mr-[env(safe-area-inset-right)] z-50 w-14 h-14 rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/30 bg-gradient-to-r from-[#7C805A] to-[#6A7150]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-7 h-7 text-[#F5E6D3] fill-current drop-shadow"
      >
        <path d="M19.11 17.53c-.26-.13-1.54-.76-1.77-.85-.24-.09-.41-.13-.58.13-.17.26-.66.84-.81 1.01-.15.17-.3.2-.56.07-.26-.13-1.08-.4-2.05-1.27-.76-.68-1.27-1.51-1.42-1.77-.15-.26-.02-.4.11-.53.11-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.05-.32-.02-.45-.07-.13-.57-1.39-.78-1.9-.21-.5-.41-.43-.56-.44-.15-.01-.31-.01-.47-.01-.16 0-.43.06-.65.32-.22.26-.86.88-.86 2.15 0 1.27.88 2.68 1.01 2.86.13.18 1.8 2.99 4.36 4.2.61.29 1.08.46 1.45.58.61.21 1.16.18 1.6.11.49-.07 1.5-.67 1.71-1.31.21-.64.21-1.2.15-1.31-.06-.12-.23-.18-.49-.31z"/>
        <path d="M16.02 3.2C9.48 3.2 4.2 8.48 4.2 15.02c0 2.01.53 3.98 1.54 5.7L4 27.8l7.22-1.89a11.78 11.78 0 004.8 1.02c6.54 0 11.82-5.28 11.82-11.82S22.56 3.2 16.02 3.2zm0 21.28a9.44 9.44 0 01-4.65-1.25l-.33-.19-4.64 1.21 1.24-4.54-.2-.34a9.44 9.44 0 1115.16 5.11 9.37 9.37 0 01-6.58 2z"/>
      </svg>
    </a>
  );
}


