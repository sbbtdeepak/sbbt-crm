import { getLeads } from "./actions";
import LeadContent from "./components/LeadContent";
import { LeadQueryParams } from "./types";

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    source?: string;
    date_from?: string;
    date_to?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: Props) {
  const params = await searchParams;

  const queryParams: LeadQueryParams = {
    search: params.search || undefined,
    status: params.status || undefined,
    source: params.source || undefined,
    date_from: params.date_from || undefined,
    date_to: params.date_to || undefined,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: params.limit ? parseInt(params.limit, 10) : 20,
  };

  const result = await getLeads(queryParams);

  return (
    <LeadContent
      leads={result.data}
      error={undefined}
      query={queryParams}
      result={result}
    />
  );
}
