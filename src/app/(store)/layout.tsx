import { getAnnouncements } from "@/lib/catalog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CatalogProvider } from "@/components/CatalogProvider";
import { AnnouncementBar } from "@/components/AnnouncementBar";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const announcements = await getAnnouncements();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white focus:p-3">
        Skip to content
      </a>
      <CatalogProvider>
        <AnnouncementBar items={announcements} />
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </CatalogProvider>
    </>
  );
}
