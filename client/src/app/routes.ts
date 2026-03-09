import { createBrowserRouter } from "react-router";
import { PortalLayout } from "./components/portal-layout";
import { HomePage } from "./components/pages/home-page";
import { TestResultsPage } from "./components/pages/test-results-page";
import { MedicationsPage } from "./components/pages/medications-page";
import { FindDoctorPage } from "./components/pages/find-doctor-page";
import { AppointmentsPage } from "./components/pages/appointments-page";
import { MessagesPage } from "./components/pages/messages-page";
import { BillingPage } from "./components/pages/billing-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PortalLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "test-results", Component: TestResultsPage },
      { path: "medications", Component: MedicationsPage },
      { path: "find-doctor", Component: FindDoctorPage },
      { path: "appointments", Component: AppointmentsPage },
      { path: "messages", Component: MessagesPage },
      { path: "billing", Component: BillingPage },
      { path: "*", Component: HomePage },
    ],
  },
]);
