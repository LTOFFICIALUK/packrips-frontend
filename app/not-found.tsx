import Link from "next/link";
import { PageHead } from "@/components/ui";

const NotFound = () => (
  <div className="px-5 py-16 md:px-12">
    <div className="mx-auto max-w-[1200px]">
      <PageHead kicker="LOST PACK" title="This page is not here.">
        The packs, the vault, and the records are still here.
      </PageHead>
      <Link href="/" className="mt-8 inline-block rounded-full bg-rip px-5 py-3 font-display text-sm text-ink">
        BACK HOME
      </Link>
    </div>
  </div>
);

export default NotFound;
