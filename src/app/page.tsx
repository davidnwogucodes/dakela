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
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { features } from "@/config/site";

export default function HomePage() {
  return (
    <>
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
      {features.showStickyBar && <FloatingWhatsApp />}
    </>
  );
}
