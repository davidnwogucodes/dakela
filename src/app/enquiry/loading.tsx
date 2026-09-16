import { Loading } from "@/components/Loading";

/**
 * Shown while the enquiry route is being fetched.
 *
 * The page itself is static, so on a fast connection this barely appears —
 * which is the point. Next only renders a loading state when there is real
 * waiting to fill, so this costs nothing when there is none.
 */
export default function EnquiryLoading() {
  return <Loading label="Opening the form" />;
}
