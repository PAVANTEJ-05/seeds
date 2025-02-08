import { PrivyProvider } from "@privy-io/react-auth";
// import Auth from "../../auth/a";
import Dashboard from "./Dashboard";
function Home() {
  return (
    <>
      <PrivyProvider
        appId="cm6i46sr000x2j9ednfaulwg2"
        config={{
          appearance: {
            theme: "light",
            accentColor: "#676FFF",
            // logo: "https://your-logo-url",
          },
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
        }}
      >
        {/* <Auth /> */}
        <Dashboard />
      </PrivyProvider>
    </>
  );
}

export default Home;
