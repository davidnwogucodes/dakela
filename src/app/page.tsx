import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CredibilityStrip } from "@/components/CredibilityStrip";
import { About } from "@/components/About";
import { Products } from "@/components/Products";
import { Process } from "@/components/Process";
import { Markets } from "@/components/Markets";
import { Suppliers } from "@/components/Suppliers";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { FloatingEnquiry } from "@/components/FloatingEnquiry";
import { ThemeStyle } from "@/components/ThemeStyle";
import { features } from "@/config/site";

/**
 * Incremental static regeneration.
 *
 * The page is still served as static HTML; it is just rebuilt at most once a
 * minute if someone asks for it. Saving in the dashboard calls revalidatePath("/")
 * and rebuilds it immediately, so this interval is only a backstop for content
 * changed directly in Supabase.
 */
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <ThemeStyle />
      <Header />
      <main>
        <Hero />
        <CredibilityStrip />
        <About />
        <Products />
        <Process />
        <Markets />
        {features.showSuppliers && <Suppliers />}
        <Contact />
      </main>
      <Footer />
      {features.showStickyBar && <FloatingEnquiry />}
    </>
  );
}
