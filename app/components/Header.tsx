import {Link} from "react-router-dom";
import {useUser} from "~/context/user";
import {Logo} from "./Logo";
import {Menu, Transition} from "@headlessui/react";
import {FaUser} from "react-icons/fa";
import {FC} from "react";

const MenuItem: FC<{to?: string; href?: string; disabled?: boolean}> = ({
  children,
  href,
  to,
  disabled,
}) => {
  return (
    <Menu.Item disabled={disabled}>
      {({active}) => {
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

export default function Header({className}: {className?: string}) {
  const user = useUser();
  return (
    <div className={`flex justify-between items-center h-12 ${className}`}>
      <Link
        to="/"
        className="pointer-cursor flex items-center h-full text-white"
      >
        <Logo color="currentcolor" height="100%" />
        <span className="ml-2 font-bold text-2xl hidden sm:block">Thorium</span>
      </Link>
      <div className="flex items-center gap-4 text-lg">
        <Link to="/blog">Blog</Link>

        {user ? (
          <Menu>
            {({open}: {open: boolean}) => (
              <>
                <Menu.Button className="rounded-full h-12 w-12 bg-tgray-400 flex justify-center items-center cursor-pointer hover:bg-tgray-300 transition-colors">
                  {user.profilePictureUrl ? (
                    <img
                      draggable={false}
                      src={user.profilePictureUrl}
                      className="rounded-full w-full h-full object-contain"
                    />
                  ) : (
                    <FaUser className="text-3xl" />
                  )}
                </Menu.Button>

                <Transition
                  show={open}
                  className="transform translate-y-6 absolute right-0 top-10 z-10"
                  enter="transition ease-out duration-100"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Menu.Items
                    static
                    className="w-56 mt-2 origin-top-right bg-tgray-600 border border-tgray-200 divide-y divide-tgray-100 rounded-md shadow-lg outline-none"
                  >
                    <div className="px-4 py-3">
                      <span className="text-sm leading-5">Signed in as </span>
                      <span className="text-sm font-medium leading-5 text-cerise-300 truncate">
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
