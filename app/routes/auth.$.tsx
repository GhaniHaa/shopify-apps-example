import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await authenticate.admin(request);
  console.log('session', session)
  
  return null;
};
