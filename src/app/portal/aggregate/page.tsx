import { AggregateWizard } from "@/components/portal/AggregateWizard";

export default function AggregatePage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-start justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <AggregateWizard />
      </div>
    </div>
  );
}
