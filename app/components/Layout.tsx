import { useMatches } from "@remix-run/react";
import { ReactNode } from "react";
import { Footer } from "./Footer";
import Header from "./Header";

export default function Layout({ children }: { children: ReactNode }) {
  const matches = useMatches();
  const noLayout = matches.find((match) => match.handle?.noLayout);
  if (noLayout) return <>{children}</>;
  return (
    <div className="flex min-h-full flex-col items-center">
      <Header className="absolute z-10 mx-auto mt-8 w-full max-w-4xl px-8"></Header>
      <div className="flex w-full flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
