// import { Redirect } from "expo-router";

// export default function Index() {
//   return <Redirect href="/guest" />;
// }

import { Redirect, type Href } from "expo-router";

export default function Index() {
  return (
    <Redirect href={"/onboarding/nickname" as Href} />
  );
}