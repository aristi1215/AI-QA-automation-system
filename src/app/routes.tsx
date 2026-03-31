import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Testing } from "./pages/Testing";
import { TestCases } from "./pages/TestCases";
import { Bugs } from "./pages/Bugs";
import { History } from "./pages/History";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "testing", Component: Testing },
      { path: "testcases", Component: TestCases },
      { path: "bugs", Component: Bugs },
      { path: "history", Component: History },
      { path: "*", Component: NotFound },
    ],
  },
]);
