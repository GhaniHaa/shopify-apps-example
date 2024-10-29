import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  DataTable,
  ResourceList,
} from "@shopify/polaris";
// import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const productResponse = await admin.graphql(
    `#graphql
      query getProducts {
        products(first: 10) {
          edges {
            node {
              id
              title
              handle
              status
              variants(first: 10) {
                edges {
                  node {
                    id
                    price
                    barcode
                    createdAt
                  }
                }
              }
            }
          }
        }
      }`
  );

  const productResponseJson = await productResponse.json();


  const locationResponse = await admin.graphql(
    `#graphql
    query getShopDetails {
      shop {
        name
        email
        myshopifyDomain
        primaryDomain {
          url
          host
        }
        currencyCode
        timezoneAbbreviation
        timezoneOffset
        plan {
          displayName
        }
        contactEmail
        billingAddress {
          address1
          address2
          city
          province
          country
          zip
        }
      }
    }`
  );

  const shopResponseJson = await locationResponse.json();

  const orderResponse = await admin.graphql(
    `#graphql
      query getOrders {
        orders(first: 50) {
          edges {
            node {
              id
              name
              billingAddress{
                name
                address1
                address2
                province
                city
                phone
                countryCodeV2
                zip
              }
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              shippingLine {
                title
                code
                originalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                source
              }
              createdAt
            }
          }
        }
      }`
  );

  const orderResponseJson = await orderResponse.json();
  const filteredOrders = orderResponseJson.data.orders.edges
    .map((edge: any) => edge.node)
    .filter((order: any) => order.shippingLine?.source.includes('Everpro Shipping rates'));

  return json({
    products: productResponseJson.data!.products!.edges.map((edge: any) => edge.node),
    shop: shopResponseJson.data.shop,
    orders: filteredOrders
  });
};

export default function Index() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let isLoading = false;
  const fetcher = useFetcher<typeof action>();
  const fetchShippingRates = () => fetcher.submit({}, { method: "POST" });
  const getShippingRates = async () => {
    isLoading = true
    try {
      await fetch('/shipping-rate', { method: "GET" })
      alert('Success Integrate Shipping')
    } catch(err) {
      alert('Failed Integrate Shipping')
    }
    isLoading = false
  };

  useEffect(() => {
    // Define the async function to fetch data
    const fetchRates = async () => {
      try {
        const response = await fetch("/carrier-response");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setRates(result.rates);
        console.log('rates', rates)
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Call the fetchData function
    fetchRates();
  }, []);

  return (
    <Page>
      {/* <TitleBar title="Remix app template">
        <button variant="primary" onClick={generateProduct}>
          Generate a product
        </button>
      </TitleBar> */}
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Congrats on creating a new Shopify app 🎉
                  </Text>
                  <Text variant="bodyMd" as="p">
                    This embedded app template uses{" "}
                    <Link
                      url="https://shopify.dev/docs/apps/tools/app-bridge"
                      target="_blank"
                      removeUnderline
                    >
                      App Bridge
                    </Link>{" "}
                    interface examples like an{" "}
                    <Link url="/app/additional" removeUnderline>
                      additional page in the app nav
                    </Link>
                    , as well as an{" "}
                    <Link
                      url="https://shopify.dev/docs/api/admin-graphql"
                      target="_blank"
                      removeUnderline
                    >
                      Admin GraphQL
                    </Link>{" "}
                    mutation demo, to provide a starting point for app
                    development.
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Get started with products
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Generate a product with GraphQL and get the JSON output for
                    that product. Learn more about the{" "}
                    <Link
                      url="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
                      target="_blank"
                      removeUnderline
                    >
                      productCreate
                    </Link>{" "}
                    mutation in our API references.
                  </Text>
                </BlockStack>
                <InlineStack gap="300">
                  <Button onClick={fetchShippingRates}>
                    Sync Order + Store Info 
                  </Button>
                  <Button loading={isLoading} onClick={getShippingRates}>
                    Integrate Shipping
                  </Button>
                  {/* {fetcher.data?.product && (
                    <Button
                      url={`shopify:admin/products/${productId}`}
                      target="_blank"
                      variant="plain"
                    >
                      View product
                    </Button>
                  )} */}
                </InlineStack>
                {fetcher.data?.products && (
                  <>
                    <Text as="h3" variant="headingMd">
                      Sync Order used Custom Shipping
                    </Text>
                    <DataTable
                      columnContentTypes={["text", "text", "text", "text", "text", "text"]}
                      headings={["Order Name", "Service Name", "Service Code", "Full Address", "Province", "City", "Phone Number"]}
                      rows={fetcher.data.orders.map((order : any) => [
                        order.name,
                        order.shippingLine.title,
                        order.shippingLine.code,
                        order.billingAddress.address1 + order.billingAddress.address2 + order.billingAddress.zip,
                        order.billingAddress.province,
                        order.billingAddress.city,
                        order.billingAddress.phone || 'unset',
                      ])}
                    />
                    {/* <ResourceList
                      resourceName={{ singular: "order", plural: "orders" }}
                      items={orders}
                      renderItem={(order) => {
                        const { id, name, totalPriceSet, shippingLine, createdAt } = order;
                        const price = `${totalPriceSet.shopMoney.amount} ${totalPriceSet.shopMoney.currencyCode}`;
                        const shippingMethod = shippingLine.title;
                        const orderDate = new Date(createdAt).toLocaleDateString();

                        return (
                          <ResourceList.Item id={id} accessibilityLabel={`View details for ${name}`}>
                            <h3>
                              <TextStyle variation="strong">{name}</TextStyle>
                            </h3>
                            <div>Price: {price}</div>
                            <div>Shipping Method: {shippingMethod}</div>
                            <div>Order Date: {orderDate}</div>
                          </ResourceList.Item>
                        );
                      }}
                    /> */}
                  </>
                )}
              </BlockStack>
            </Card>

            {/* <Card>
              <h2 style={"font-size: 16px;font-weight: bold"}>THIS IS PRODUCT LIST</h2>
            { <DataTable
                columnContentTypes={["text", "text", "text", "text"]}
                headings={["Product Title", "Handle", "Status", "Action"]}
                rows={fetcher.data.products.map((product : any) => [
                  product.title,
                  product.handle,
                  product.status,
                  <Button
                    key={product.id}
                    onClick={() =>
                      fetcher.submit(
                        {
                          variantId: product.variants.edges[0].node.id,
                          quantity: 1, // You can allow user to choose quantity if needed
                        },
                        {
                          method: "post",
                          action: `/checkout`,
                        }
                      )
                    }
                  >
                    Buy Now
                  </Button>,
                ])}
              /> }
            </Card> */}

            <Card>
                <BlockStack gap="200">
                  <ResourceList
                    resourceName={{ singular: "shipping rate", plural: "shipping rates" }}
                    items={rates}
                    renderItem={(rate) => {
                      const { service_name, total_price, currency, min_delivery_date, max_delivery_date } = rate;
                      const price = `${(total_price / 100).toFixed(2)} ${currency}`;
                      const deliveryWindow = `${new Date(min_delivery_date).toLocaleDateString()} - ${new Date(
                        max_delivery_date
                      ).toLocaleDateString()}`;

                      return (
                        <ResourceList.Item
                          id={service_name}
                          accessibilityLabel={`View details for ${service_name}`}
                        >
                          <h3>
                            {service_name}
                          </h3>
                          <div>Price: {price}</div>
                          <div>Delivery Window: {deliveryWindow}</div>
                        </ResourceList.Item>
                      );
                    }}
                  />
                  
                </BlockStack>
              </Card>
            {fetcher.data?.shop && (
              <Card>
                <BlockStack gap="200">
                  <>
                    <Text as="h3" variant="headingMd">
                      Store Information
                    </Text>
                    <DataTable
                      columnContentTypes={["text", "text"]}
                      headings={["Detail", "Value"]}
                      rows={[
                        ["Store Name", fetcher.data.shop.name],
                        ["Email", fetcher.data.shop.email],
                        ["MyShopify Domain", fetcher.data.shop.myshopifyDomain],
                        ["Primary Domain URL", fetcher.data.shop.primaryDomain.url],
                        ["Primary Domain Host", fetcher.data.shop.primaryDomain.host],
                        ["Currency Code", fetcher.data.shop.currencyCode],
                        ["Timezone", fetcher.data.shop.timezoneAbbreviation],
                        ["Timezone Offset", fetcher.data.shop.timezoneOffset],
                        ["Shopify Plan", fetcher.data.shop.plan.displayName],
                        ["Contact Email", fetcher.data.shop.contactEmail],
                        ["Phone", fetcher.data.shop.phone],
                        ["Shop Owner", fetcher.data.shop.shopOwner],
                        ["Address 1", fetcher.data.shop.billingAddress.address1],
                        ["Address 2", fetcher.data.shop.billingAddress.address2 || "N/A"],
                        ["City", fetcher.data.shop.billingAddress.city],
                        ["Province", fetcher.data.shop.billingAddress.province || "N/A"],
                        ["Country", fetcher.data.shop.billingAddress.country],
                        ["ZIP Code", fetcher.data.shop.billingAddress.zip],
                      ]}
                    />
                  </>
                </BlockStack>
              </Card>
            )}

          </Layout.Section>
          {/* <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    App template specs
                  </Text>
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Framework
                      </Text>
                      <Link
                        url="https://remix.run"
                        target="_blank"
                        removeUnderline
                      >
                        Remix
                      </Link>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Database
                      </Text>
                      <Link
                        url="https://www.prisma.io/"
                        target="_blank"
                        removeUnderline
                      >
                        Prisma
                      </Link>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Interface
                      </Text>
                      <span>
                        <Link
                          url="https://polaris.shopify.com"
                          target="_blank"
                          removeUnderline
                        >
                          Polaris
                        </Link>
                        {", "}
                        <Link
                          url="https://shopify.dev/docs/apps/tools/app-bridge"
                          target="_blank"
                          removeUnderline
                        >
                          App Bridge
                        </Link>
                      </span>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        API
                      </Text>
                      <Link
                        url="https://shopify.dev/docs/api/admin-graphql"
                        target="_blank"
                        removeUnderline
                      >
                        GraphQL API
                      </Link>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Next steps
                  </Text>
                  <List>
                    <List.Item>
                      Build an{" "}
                      <Link
                        url="https://shopify.dev/docs/apps/getting-started/build-app-example"
                        target="_blank"
                        removeUnderline
                      >
                        {" "}
                        example app
                      </Link>{" "}
                      to get started
                    </List.Item>
                    <List.Item>
                      Explore Shopify’s API with{" "}
                      <Link
                        url="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
                        target="_blank"
                        removeUnderline
                      >
                        GraphiQL
                      </Link>
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section> */}
        </Layout>
      </BlockStack>
    </Page>
  );
}
