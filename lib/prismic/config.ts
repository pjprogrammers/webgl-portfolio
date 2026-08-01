export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT ?? "jashansingla";

export const prismicConfig = {
  repositoryName,
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
} as const;
