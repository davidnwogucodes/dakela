import { Loading } from "@/components/Loading";

/**
 * Shown while any dashboard page loads. These are force-dynamic and read from
 * the database on every request, so unlike the public pages they genuinely wait
 * — this is the loading state that earns its keep.
 *
 * It renders inside the dashboard layout, so the sidebar stays put and only the
 * content column swaps. Navigating between sections therefore never looks like
 * the whole dashboard reloaded.
 */
export default function DashboardLoading() {
  return <Loading label="Loading" />;
}
