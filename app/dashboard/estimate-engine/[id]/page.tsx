import { notFound } from "next/navigation";
import { getEstimateById } from "../actions";
import EstimateDetails from "../components/EstimateDetails";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EstimateDetailsPage({ params }: Props) {
  const { id } = await params;
  const estimateId = parseInt(id, 10);

  if (isNaN(estimateId)) {
    notFound();
  }

  const estimateData = await getEstimateById(estimateId);

  if (!estimateData) {
    notFound();
  }

  return <EstimateDetails estimateData={estimateData} />;
}
