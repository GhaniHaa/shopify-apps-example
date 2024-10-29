import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export let loader = async () => {
  return json({ message: "Hello World!" });
};

export default function Hello() {
  let data = useLoaderData();
  return <div>{data.message}</div>;
}
