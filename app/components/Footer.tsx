import { Link } from "@remix-run/react";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import Fyreworks from "./Fyreworks";
const navigation = {
  main: [
    { name: "About", href: "/" },
    { name: "Blog", href: "/blog" },
  ],
  social: [
    {
      name: "Twitter",
      href: "https://twitter.com/thoriumsim",
      icon: FaTwitter,
    },
    {
      name: "GitHub",
      href: "https://github.com/thorium-sim/thorium-nova",
      icon: FaGithub,
    },
    {
      name: "Discord",
      href: "https://discord.gg/BxwXaUB",
      icon: FaDiscord,
    },
  ],
};

export const Footer = () => {
  return (
    <footer className="w-full bg-tgray-700">
      <div className="mx-auto max-w-7xl overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        <nav
          className="-mx-5 -my-2 flex flex-wrap justify-center"
          aria-label="Footer"
        >
          {navigation.main.map((item) => (
            <div key={item.name} className="px-5 py-2">
              <Link
                to={item.href}
                className="text-base text-gray-500 hover:text-gray-900"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          {navigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <a
          className="mx-auto my-8 block text-center opacity-50 transition-opacity hover:opacity-100"
          href="https://fyreworks.us/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Fyreworks width={177} className="mx-auto" />
        </a>
        <section className="mx-auto text-center text-opacity-50">
          Copyright &copy; {new Date().getFullYear()} Fyreworks LLC.
        </section>{" "}
      </div>
    </footer>
  );
};
