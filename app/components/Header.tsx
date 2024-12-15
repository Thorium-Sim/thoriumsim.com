import { useUser } from "~/context/user";
import { Logo } from "./Logo";
import { Menu, Transition } from "@headlessui/react";
import { FaUser } from "react-icons/fa";
import type { FC } from "react";
import { Link } from "@remix-run/react";

const MenuItem: FC<{ to?: string; href?: string; disabled?: boolean }> = ({
  children,
  href,
  to,
  disabled,
}) => {
  return (
    <Menu.Item disabled={disabled}>
      {({ active }) => {
        const classes = `${
          active ? "bg-tgray-100 text-gray-100" : "text-gray-300"
        } flex justify-between w-full px-4 py-2 text-sm leading-5 text-left cursor-pointer hover:text-white`;
        return to ? (
          <Link to={to} className={classes}>
            {children}
          </Link>
        ) : (
          <a href={href} className={classes}>
            {children}
          </a>
        );
      }}
    </Menu.Item>
  );
};

export default function Header({ className }: { className?: string }) {
  const user = useUser();
  return (
    <div className={`flex h-12 items-center justify-between ${className}`}>
      <Link
        to="/"
        className="pointer-cursor flex h-full items-center text-white"
      >
        <Logo color="currentcolor" height="100%" />
        <span className="ml-2 hidden text-2xl font-bold sm:block">Thorium</span>
      </Link>
      <div className="flex items-center gap-4 text-lg">
        <Link to="/blog">Blog</Link>

        {user ? (
          <Menu>
            {({ open }: { open: boolean }) => (
              <>
                <Menu.Button className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-tgray-400 transition-colors hover:bg-tgray-300">
                  {user.profilePictureUrl ? (
                    <img
                      draggable={false}
                      src={user.profilePictureUrl}
                      className="h-full w-full rounded-full object-contain"
                    />
                  ) : (
                    <FaUser className="text-3xl" />
                  )}
                </Menu.Button>

                <Transition
                  show={open}
                  className="absolute right-0 top-10 z-10 translate-y-6 transform"
                  enter="transition ease-out duration-100"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Menu.Items
                    static
                    className="mt-2 w-fit origin-top-right divide-y divide-tgray-100 rounded-md border border-tgray-200 bg-tgray-600 shadow-lg outline-none"
                  >
                    <div className="flex flex-col px-4 py-3">
                      <span className="text-sm leading-5">Signed in as </span>
                      <span className="truncate text-sm font-medium leading-5 text-cerise-300">
                        {user.email}
                      </span>
                    </div>

                    {user.roles?.includes("admin") && (
                      <div className="py-1">
                        <MenuItem to="/admin">Admin</MenuItem>
                      </div>
                    )}
                    <div className="py-1">
                      <MenuItem to="/profile">Your Profile</MenuItem>
                    </div>

                    <div className="py-1">
                      <MenuItem href="/logout">Sign out</MenuItem>
                    </div>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </div>
  );
}
