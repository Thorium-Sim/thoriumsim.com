import {ReactNode} from "react";
import {Footer} from "./Footer";
import Header from "./Header";

export default function Layout({children}: {children: ReactNode}) {
  return (
    <div className="flex flex-col min-h-full items-center">
      <Header className="absolute w-full max-w-4xl mx-auto px-8 mt-8 z-10"></Header>
      <div className="flex-1 w-full flex flex-col">{children}</div>
      <Footer />
    </div>
  );
}
