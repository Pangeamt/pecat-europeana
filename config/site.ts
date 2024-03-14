export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Pecat + MINT",
  description: "PECAT + MINT integration",
  navItems: [
    {
      label: "Files",
      href: "/dashboard",
    },
    {
      label: "Users",
      href: "/dashboard/users",
    },
  ],
  navMenuItems: [
    {
      label: "Files",
      href: "/dashboard",
    },
    {
      label: "Users",
      href: "/dashboard/users",
    },
  ],
  links: {
    // github: "https://github.com/nextui-org/nextui",
    // twitter: "https://twitter.com/getnextui",
    // docs: "https://nextui.org",
    // discord: "https://discord.gg/9b6yyZKmH4",
    // sponsor: "https://patreon.com/jrgarciadev",
  },
};
