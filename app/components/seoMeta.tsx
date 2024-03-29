import { RouteData } from "@remix-run/react/routeData";
import { AppData, MetaFunction } from "@remix-run/server-runtime";
import { Params } from "react-router-dom";
import hero from "../images/hero.jpg";

interface SeoMetaProps {
  data: AppData;
  parentsData: RouteData;
  params: Params;
  location: Location;
}
export const seoMeta = (
  override:
    | Record<string, string>
    | ((props: SeoMetaProps) => Record<string, string>) = {}
): MetaFunction => {
  return (props) => {
    const {
      title = "Thorium Nova",
      description = "A starship bridge simulator game. Get your friends to be Captain, Weapons, or Navigation, follow your mission briefing, and take off into the stars!",
      image = "https://files.thoriumsim.com/file/thorium-public/storage/email-header.jpg",
      ...extra
    } = typeof override === "function" ? override(props as any) : override;
    const { location } = props;
    return {
      title,
      description,

      viewport: "width=device-width, initial-scale=1",

      "theme-color": "#000000",

      "twitter:card": "summary_large_image",
      "twitter:site": "Thorium Nova",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:creator": "@thoriumsim",
      "twitter:image": image,

      "og:title": title,
      "og:url": location.pathname,
      "og:image": image,
      "og:description": description,
      "og:site_name": "Thorium Nova",
      ...extra,
    };
  };
};
