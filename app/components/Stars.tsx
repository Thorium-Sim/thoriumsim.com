import {ReactNode} from "react";
export {default as styles} from "../styles/404.css";

const Stars = ({children}: {children?: ReactNode}) => {
  return (
    <div className="h-full min-h-[calc(100vh-30px)] flex-1 flex flex-col justify-center items-center stars-container relative">
      <div className="absolute left-0 top-0 pointer-events-none">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>
      {children}
    </div>
  );
};

export default Stars;
