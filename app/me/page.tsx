import type { Metadata } from "next";
import { MeView } from "@/components/me-view";

export const metadata: Metadata = { title: "My pulls" };

const Page = () => <MeView />;

export default Page;
