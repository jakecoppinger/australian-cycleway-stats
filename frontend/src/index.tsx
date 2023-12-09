import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import { render } from "react-dom";
import React from "react";
import "./index.css";
import { IndexPageComponent } from "./pages/index-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexPageComponent />,
  },
]);

render(
  <React.StrictMode>
      <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById("root")
);
