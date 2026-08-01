import type { Handle } from "remix/ui";

export function SeoMeta(
  handle: Handle<{ path: string; title?: string; description?: string; imageUrl?: string }>,
) {
  const {
    path,
    title = "Thorium Nova",
    description = "Assemble your crew. Take your station. Complete your mission.",
    imageUrl = "https://assets.thoriumsim.com/email-header.jpg",
  } = handle.props;
  return () => (
    <>
      <title>{title}</title>
      <meta name="color-scheme" content="light dark" />
      <meta content={description} name="description" />
      <meta content="#000000" name="theme-color" />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content="Thorium Nova" name="twitter:site" />
      <meta content={title} name="twitter:title" />
      <meta content={description} name="twitter:description" />
      <meta content="@thoriumsim" name="twitter:creator" />
      <meta content={imageUrl} name="twitter:image" />
      <meta content={title} property="og:title" />
      <meta content={`https://thoriumsim.com${path}`} property="og:url" />
      <meta content={imageUrl} property="og:image" />
      <meta content={description} property="og:description" />
      <meta content="Thorium Nova" property="og:site_name" />
    </>
  );
}
