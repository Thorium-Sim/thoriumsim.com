import Layout from "../components/Layout";
import {VFC} from "react";
import {Link, LinksFunction} from "remix";
import ErrorPage, {styles} from "~/components/Errors";

export let links: LinksFunction = () => {
  return [{rel: "stylesheet", href: styles}];
};

export function meta() {
  return {title: "Thorium - Page Not Found"};
}

const FourOhFour: VFC = () => {
  return (
    <Layout>
      <ErrorPage
        title="404"
        text={
          <Link
            to="/"
            className="text-thorium-300 hover:text-thorium-400 mt-8 pointer-events-auto z-50"
          >
            Return Home
          </Link>
        }
      />
    </Layout>
  );
};

export default FourOhFour;
