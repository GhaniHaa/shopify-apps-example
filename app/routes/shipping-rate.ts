import { LoaderFunction, redirect } from "@remix-run/node";
import shopify, { authenticate } from "../shopify.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await authenticate.admin(request);

  if (!session) {
    console.error("Session is not available.");
    return new Response("Authentication failed", { status: 401 });
  }

  try {
    const carrierServiceMutation = await session.admin.graphql(
      `#graphql
        mutation {
          carrierServiceCreate(
            input: {
              name: "Everpro Shipping rates",
              callbackUrl: "https://e689-113-11-180-14.ngrok-free.app/carrier-service",
              supportsServiceDiscovery: true,
              active: true,
            }
          ) {
              carrierService {
                id
                name
                active
                supportsServiceDiscovery
                formattedName
                icon {
                  url
                }
                availableServicesForCountries(
                  restOfWorld: true
                ) {
                  name
                  countries {
                    countryCodes
                    restOfWorld
                  }
                }
            }
            userErrors {
              field
              message
            }
          }
        }
      `
    );

    if (carrierServiceMutation.status !== 200) {
      console.error("Error creating carrier service:", carrierServiceMutation.status);
      return new Response("Failed to create carrier service", { status: 500 });
    } else {
      console.log("Carrier service created");
      return new Response("Carrier service created", { status: 200 });
    }
  } catch (error) {
    console.error("Max retries reached. Returning error.");
    return new Response("Internal server error", { status: 500 });
  }
};
