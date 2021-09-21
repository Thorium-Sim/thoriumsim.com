import {SVGProps} from "react";

export function Logo(props: SVGProps<SVGSVGElement> & {color?: string}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 512 512"
      {...props}
    >
      <g>
        <path
          fill={props.color ? props.color : "url(#_Linear1)"}
          d="M191.995 296.773a249.132 249.132 0 009.186 50.471c-39.931 29.977-67.544 75.481-73.875 127.551-1.565 12.876-13.289 22.058-26.164 20.492-12.876-1.565-22.058-13.289-20.492-26.164 8.884-73.07 51.281-135.809 111.345-172.35zm76.541-29.71a236.112 236.112 0 0145.451-4.392c120.129 0 219.219 90.128 233.363 206.44 1.566 12.875-7.616 24.599-20.491 26.165-12.875 1.565-24.599-7.616-26.165-20.491-11.315-93.045-90.609-165.114-186.707-165.114a188.655 188.655 0 00-41.757 4.652 173.73 173.73 0 01-3.99-37.118c0-3.398.1-6.781.296-10.142z"
          transform="matrix(.1151 0 0 -.1151 -101.374 770.683) matrix(9.52381 0 0 -9.52381 114.286 7314.29)"
        ></path>
        <path
          fill={props.color ? props.color : "url(#_Linear2)"}
          d="M366.397 332.746a172.37 172.37 0 0142.79 20.426c-31.595 92.558-119.29 159.11-222.53 159.11a235.088 235.088 0 01-91.862-18.691c-11.939-5.069-17.517-18.876-12.449-30.815 5.069-11.939 18.876-17.517 30.815-12.448a188.077 188.077 0 0073.496 14.954c66.335 0 124.648-34.342 158.132-86.216a187.154 187.154 0 0021.608-46.32zm6.998-77.974c-6.112-50.997-32.857-97.125-73.555-127.784-10.359-7.804-12.434-22.55-4.63-32.909 7.804-10.36 22.55-12.435 32.91-4.631 56.876 42.845 91.952 109.861 93.556 182.539a248.226 248.226 0 00-48.281-17.215z"
          transform="matrix(.1151 0 0 -.1151 -101.374 770.683) matrix(9.52381 0 0 -9.52381 114.286 7314.29)"
        ></path>
        <path
          fill={props.color ? props.color : "url(#_Linear3)"}
          d="M367.283 450.15c22.719 9.739 47.747 15.132 74.034 15.132 46.321 0 71.53-14.12 73.519-14.965 11.938-5.069 25.747.507 30.816 12.445 5.07 11.938-.506 25.746-12.444 30.816-2.486 1.056-33.995 18.704-91.891 18.704-40.984 0-79.519-10.488-113.063-28.926a251.41 251.41 0 0039.029-33.206zm-102.959-18.232c-36.168-41.343-58.084-95.468-58.084-154.713 0-74.684 35.368-143.889 93.6-187.757 10.36-7.804 25.106-5.729 32.91 4.63 7.804 10.36 5.729 25.106-4.63 32.91-46.588 35.096-74.88 90.466-74.88 150.217 0 49.355 19.011 94.27 50.11 127.822a173.448 173.448 0 01-39.026 26.891z"
          transform="matrix(.1151 0 0 -.1151 -101.374 770.683) matrix(9.52381 0 0 -9.52381 114.286 7314.29)"
        ></path>
      </g>
      <defs>
        <linearGradient
          id="_Linear1"
          x1="0"
          x2="1"
          y1="0"
          y2="0"
          gradientTransform="matrix(467.048 363 -363 467.048 80.476 123)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F94CC3"></stop>
          <stop offset="1" stopColor="#4800AF"></stop>
        </linearGradient>
        <linearGradient
          id="_Linear2"
          x1="0"
          x2="1"
          y1="0"
          y2="0"
          gradientTransform="matrix(467.048 363 -363 467.048 80.476 123)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F94CC3"></stop>
          <stop offset="1" stopColor="#4800AF"></stop>
        </linearGradient>
        <linearGradient
          id="_Linear3"
          x1="0"
          x2="1"
          y1="0"
          y2="0"
          gradientTransform="matrix(467.048 363 -363 467.048 80.476 123)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F94CC3"></stop>
          <stop offset="1" stopColor="#4800AF"></stop>
        </linearGradient>
      </defs>
    </svg>
  );
}
