import { getData } from "@/lib/data";
import PatientSearch from "./patient-search";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { offices } = await getData();
  return <PatientSearch offices={offices} />;
}
