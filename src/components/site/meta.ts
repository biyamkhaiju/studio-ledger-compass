export const siteHead = (title: string, description: string) => ({
  meta: [
    { title: `${title} — SainoX Digital Invitations` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — SainoX Digital Invitations` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
