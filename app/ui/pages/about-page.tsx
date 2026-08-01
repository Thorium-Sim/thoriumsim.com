import { Frame } from "remix/ui";
import { routes } from "../../routes.ts";
import { Layout } from "../layout.tsx";
import { proseStyles } from "../../utils/proseStyles.ts";
import { SeoMeta } from "../../utils/seoMeta.tsx";

export function AboutPage() {
  return () => (
    <Layout
      mix={proseStyles}
      head={
        <SeoMeta
          title="About - Thorium Nova"
          path={routes.about.href()}
          description="Learn more about the origin and purpose of Thorium Nova."
        />
      }
    >
      <Frame src={routes.aboutContent.href()} />
    </Layout>
  );
}
