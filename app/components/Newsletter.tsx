import {FaSpinner} from "react-icons/fa";
import {Form, useTransition, useLoaderData} from "remix";

const Newsletter = () => {
  const pendingForm = useTransition().submission;
  const routeData = useLoaderData();
  return (
    <div className="w-full flex items-center justify-center">
      <Form
        className="bg-gray-800 bg-opacity-20 backdrop-filter backdrop-blur-md p-8 max-w-3xl w-full shadow-lg overflow-hidden rounded-lg"
        action="/"
        method="post"
      >
        <div className="minimal h-64 flex flex-col justify-center">
          {routeData.newsletterSignup ? (
            <>
              <h3 className="font-extrabold text-5xl text-center">
                You've Signed Up!
              </h3>
              <p className="text-xl text-center pt-8">
                Now check your email to confirm your subscription.
              </p>
            </>
          ) : pendingForm ? (
            <>
              <FaSpinner className="text-6xl mb-8 mx-auto  animate-spinner" />
              <h3 className="font-extrabold text-5xl text-center">
                Subscribing...
              </h3>
            </>
          ) : (
            <>
              <div data-element="header">
                <h3 className="text-white text-4xl m-0 mb-8">
                  Join the Newsletter
                </h3>
              </div>
              <p data-element="subheader">
                Sign up to get regular updates, find ways to contribute, and get
                access to exclusive content.
              </p>
              <div className="flex flex-wrap sm:flex-nowrap mb-8">
                <div className="flex-[2] mb-2 sm:mb-0 sm:mr-4">
                  <input
                    name="email_address"
                    placeholder="Your email address"
                    required
                    type="email"
                    className="bg-white bg-opacity-10 text-base p-3 border border-coolGray-500 w-full h-full min-w-[200px] transition-all duration-200 text-white focus:outline-none focus:ring ring-thorium-400"
                  />
                </div>
                <button className="thorium-button" data-element="submit">
                  Subscribe
                </button>
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
