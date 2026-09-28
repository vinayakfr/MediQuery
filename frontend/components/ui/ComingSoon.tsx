import { ButtonLink } from "./Button";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";

/** Placeholder for screens that are in the sidebar but not built yet. */
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card title="Coming soon">
        <p className="m-0 text-muted">This screen is on the list for after the MVP.</p>
        <div>
          <ButtonLink href="/" trailingIcon="arrowRight">
            Start a new case
          </ButtonLink>
        </div>
      </Card>
    </>
  );
}
