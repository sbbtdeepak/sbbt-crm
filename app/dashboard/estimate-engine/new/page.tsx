import EstimateWizard from "../components/EstimateWizard";

// Prevent prerendering — EstimateWizard uses browser-only APIs
export const dynamic = "force-dynamic";

export default function NewEstimatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Estimate</h1>
        <p className="text-gray-500 mt-1">
          Create a professional construction estimate using the wizard.
        </p>
      </div>

      <EstimateWizard />
    </div>
  );
}
