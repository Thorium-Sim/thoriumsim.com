/* This example requires Tailwind CSS v2.0+ */
import {Fragment, useEffect, useState} from "react";
import {Dialog, Transition} from "@headlessui/react";
import {
  FaEnvelopeOpenText,
  FaFileAlt,
  FaHamburger,
  FaHome,
  FaPenAlt,
  FaTimes,
} from "react-icons/fa";
import {Link, Outlet} from "react-router-dom";
import {LoaderFunction, redirect, useMatches, useRouteData} from "remix";
import {commitSession, getSession} from "~/auth/localSession.server";
import {authenticator} from "~/auth/auth.server";
import {json} from "remix-utils";
import toast from "react-hot-toast";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const loader: LoaderFunction = async ({request}) => {
  const session = await getSession(request.headers.get("Cookie") || "");
  const userData = session.get(authenticator.sessionKey);
  if (!userData || !userData.roles.includes("admin")) {
    session.flash("error", "You do not have permission to view that page");
    return redirect("/", {
      headers: {"set-cookie": await commitSession(session)},
    });
  }
  const toast = session.get("toast");
  const error = session.get("error");
  return json(
    {toast, error},
    {headers: {"set-cookie": await commitSession(session)}}
  );
};
export default function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const matches = useMatches();
  const {toast: toastMessage, error} = useRouteData<{
    toast?: string;
    error?: string;
  }>();
  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: FaHome,
      current: matches.every(
        m => m.pathname.endsWith("/admin") || m.pathname === "/"
      ),
    },
    {
      name: "Blog",
      href: "/admin/blog",
      icon: FaFileAlt,
      current: matches.some(m => m.pathname.startsWith("/admin/blog")),
    },
    {
      name: "Newsletters",
      href: "/admin/newsletter",
      icon: FaEnvelopeOpenText,
      current: matches.some(m => m.pathname.startsWith("/admin/newsletter")),
    },
  ];

  useEffect(() => {
    if (toastMessage && typeof toastMessage === "string") {
      toast(toastMessage);
    }
    if (error && typeof toastMessage === "string") {
      toast.error(error);
    }
  }, [toastMessage, error]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 flex z-40 md:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <FaTimes
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map(item => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? "text-gray-300"
                            : "text-gray-400 group-hover:text-gray-300",
                          "mr-4 flex-shrink-0 h-6 w-6"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 bg-gray-800 space-y-1">
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? "text-gray-300"
                          : "text-gray-400 group-hover:text-gray-300",
                        "mr-3 flex-shrink-0 h-6 w-6"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <FaHamburger className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-tgray-900">
          <div className="py-6 px-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
