import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { FaSpinner } from "react-icons/fa";

const Newsletter = () => {
  const pendingForm = useTransition().submission;
  const routeData = useLoaderData();
  return (
    <div className="flex w-full items-center justify-center">
      <Form
        className="w-full max-w-3xl overflow-hidden rounded-lg bg-gray-800 bg-opacity-20 p-8 shadow-lg backdrop-blur-md backdrop-filter"
        action="/api/newsletter"
        method="post"
      >
        <div className="minimal flex h-64 flex-col justify-center">
          {routeData.newsletterSignup ? (
            <>
              <h3 className="text-center text-5xl font-extrabold">
                You've Signed Up!
              </h3>
              <p className="pt-8 text-center text-xl">
                Now check your email to confirm your subscription.
              </p>
            </>
          ) : pendingForm ? (
            <>
              <FaSpinner className="mx-auto mb-8 animate-spinner  text-6xl" />
              <h3 className="text-center text-5xl font-extrabold">
                Subscribing...
              </h3>
            </>
          ) : (
            <>
              <div data-element="header">
                <h3 className="m-0 mb-8 text-4xl text-white">
                  Join the Newsletter
                </h3>
              </div>
              <p data-element="subheader">
                Sign up to get regular updates, find ways to contribute, and get
                access to exclusive content.
              </p>
              <div className="mb-8 flex flex-wrap sm:flex-nowrap">
                <div className="mb-2 flex-[2] sm:mb-0 sm:mr-4">
                  <input
                    name="email_address"
                    placeholder="Your email address"
                    required
                    type="email"
                    className="border-coolGray-500 h-full w-full min-w-[200px] border bg-white bg-opacity-10 p-3 text-base text-white ring-thorium-400 transition-all duration-200 focus:outline-none focus:ring"
                  />
                </div>

                <button className="thorium-button" data-element="submit">
                  Subscribe
                </button>
                <div className="h-0 w-0 overflow-hidden opacity-0">
                  <input
                    name="first_name"
                    placeholder="Alex"
                    type="text"
                    className="border-coolGray-500 h-full w-full min-w-[200px] border bg-white bg-opacity-10 p-3 text-base text-white ring-thorium-400 transition-all duration-200 focus:outline-none focus:ring"
                  />
                </div>
              </div>
              <div className="text-center" data-element="guarantee">
                We won't send you spam. Unsubscribe at any time.
              </div>
            </>
          )}
        </div>
      </Form>
    </div>
  );
};

export default Newsletter;
