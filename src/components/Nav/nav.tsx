import Link from "next/link";
import Image from "next/image";

const Nav = () => (
  <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md border-b border-black">
    <div className="flex items-center gap-2">
      {/* <Image src="/next.svg" alt="Logo" width={40} height={40} className="w-10 h-10 filter grayscale" /> */}
      <span className="text-2xl font-bold text-black">QuizMe</span>
    </div>
    <ul className="flex items-center gap-6 text-lg font-medium">
      <li>
        <Link href="/" className="text-black hover:text-white hover:bg-black px-3 py-1 rounded transition-colors">Home</Link>
      </li>
      <li>
        <Link href="/about" className="text-black hover:text-white hover:bg-black px-3 py-1 rounded transition-colors">About</Link>
      </li>
      <li>
        <Link href="/faq" className="text-black hover:text-white hover:bg-black px-3 py-1 rounded transition-colors">FAQ</Link>
      </li>
      <li>
        <Link href="/login" className="text-black hover:text-white hover:bg-black px-3 py-1 rounded transition-colors">Log In</Link>
      </li>
      <li>
        <Link href="/signup" className="text-black hover:text-white hover:bg-black px-3 py-1 rounded transition-colors">Sign Up</Link>
      </li>
    </ul>
  </nav>
);

export default Nav;