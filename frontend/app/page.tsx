import { NewCaseForm } from "@/components/new-case/NewCaseForm";
import { PageHeader } from "@/components/ui/PageHeader";

/** Route "/": start a new case by uploading a patient's files. */
export default function NewCasePage() {
  return (
    <>
      <PageHeader
        title="Start a new case"
        description="Drop in everything you have for one patient. The agents figure out what each file is and pick the right model for it."
      />
      <NewCaseForm />
    </>
  );
}
