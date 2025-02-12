import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import App from "./App.jsx";
import "./index.css";
import { HashRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
const client = new ApolloClient({
  uri: "https://gateway.thegraph.com/api/d962ce4034803ffc53981050cb17a0d2/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")).render(
  <HashRouter>
    <ToastContainer position="top-right" autoClose={3000} />
    <StrictMode>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </StrictMode>
  </HashRouter>
);
