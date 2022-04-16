import { Link } from "@remix-run/react";
import me from "~/images/index/me.jpg";

const Bio = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="px-4 min-w-full max-w-3xl flex justify-center items-center flex-wrap md:flex-nowrap">
        <img
          className="bio-image w-32 h-32 rounded-full m-0 md:mr-12"
          src={me}
        />

        <div className="max-w-lg w-full">
          <h4>
            Hi There!{" "}
            <span role="img" aria-label="Wave">
              👋
            </span>
          </h4>
          <p>
            I'm Alex, creator of <Link to="/">Thorium</Link>,{" "}
            <a
              href="https://spaceedventures.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Space EdVentures
            </a>
            , and countless other simulator controls. I was a professional
            flight director at the{" "}
            <a
              href="https://spacecenter.alpineschools.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Christa McAullife Space Center
            </a>{" "}
            for 4 years and helped build the{" "}
            <a
              href="https://www.spacecamputah.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              USS Voyager II
            </a>
            .
          </p>
          <p>
            These days I'm a professional web developer with a passion for
            bridge simulators. You can read my thoughts on my{" "}
            <a
              href="https://ralexanderson.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              blog
            </a>{" "}
            and{" "}
            <a
              href="https://twitter.com/ralex1993"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Bio;
