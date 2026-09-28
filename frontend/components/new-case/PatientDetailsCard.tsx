"use client";

import type { ChangeEvent } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { PatientDetails } from "@/lib/types";

interface Props {
  value: PatientDetails;
  onChange: (next: PatientDetails) => void;
}

/** Shared look for every text field on this card. */
const FIELD = "flex flex-col gap-[7px] text-sm font-medium text-label";
const INPUT =
  "h-[46px] rounded-xl border border-input bg-sunken px-3.5 text-[15px] font-normal text-ink " +
  "focus:border-accent focus:outline-none";

/** "Who's this for?": name, age, sex and an optional note for the agents. */
export function PatientDetailsCard({ value, onChange }: Props) {
  // One handler for every field: the input's `name` matches a key of PatientDetails.
  const update = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange({ ...value, [event.target.name]: event.target.value });
  };

  return (
    <Card title="Who's this for?">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <label className={FIELD}>
          Name or ID
          <input className={INPUT} name="nameOrId" value={value.nameOrId} onChange={update} autoComplete="off" />
        </label>
        <label className={FIELD}>
          Age
          <input className={INPUT} name="age" value={value.age} onChange={update} inputMode="numeric" placeholder="e.g. 54" />
        </label>
        <label className={FIELD}>
          Sex
          <select className={INPUT} name="sex" value={value.sex} onChange={update}>
            <option value="unspecified">Not specified</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </label>
      </div>

      <label className={FIELD}>
        <span>
          Anything the agents should keep an eye on? <span className="font-normal text-subtle">Optional</span>
        </span>
        <textarea
          className={cn(INPUT, "h-auto resize-none py-3")}
          name="notes"
          rows={2}
          value={value.notes}
          onChange={update}
          placeholder="e.g. Cough for 3 weeks, check the chest X-ray and current meds"
        />
      </label>
    </Card>
  );
}
