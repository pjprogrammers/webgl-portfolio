import * as prismic from "@prismicio/client";
import { prismicConfig } from "./config";

export function createPrismicClient(
  config: prismic.ClientConfig = {},
): prismic.Client {
  return prismic.createClient(prismicConfig.repositoryName, {
    accessToken: prismicConfig.accessToken,
    ...config,
  });
}

export const prismicClient = createPrismicClient();
