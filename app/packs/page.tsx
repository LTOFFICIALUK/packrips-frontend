import type { Metadata } from "next";
import { PacksView } from "@/components/packs-view";

export const metadata: Metadata = { title: "Packs" };

const Page = () => <PacksView />;

export default Page;
