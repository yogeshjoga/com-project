import { categories } from "@/data/categories";
import { getAnnouncements, getSummaries } from "@/lib/catalog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CatalogProvider } from "@/components/CatalogProvider";
import { AnnouncementBar } from "@/components/AnnouncementBar";

const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const [items, announcements] = await Promise.all([getSummaries(), getAnnouncements()]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white focus:p-3">
        Skip to content
      </a>
      <CatalogProvider value={{ items, categoryNames }}>
        <AnnouncementBar items={announcements} />
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </CatalogProvider>
    </>
  );
}
