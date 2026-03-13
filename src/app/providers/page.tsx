import { getData } from "@/lib/data";
import ProviderSearch from "./provider-search";
import type { Person } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getData();
  const people: Person[] = [
    ...(data.providers || []).map((p) => ({ ...p, type: "Provider" as const })),
    ...(data.staff || []).map((s) => ({ ...s, type: "Staff" as const })),
  ];
  return <ProviderSearch initialPeople={people} initialOffices={data.offices} />;
}
