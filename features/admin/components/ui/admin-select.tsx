"use client";

import { AppSelect, type SelectOption } from "@/components/form-controls";

type AdminSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  name?: string;
  searchThreshold?: number;
};

export function AdminSelect(props: AdminSelectProps) {
  return <AppSelect {...props} tone="dark" />;
}

export type { SelectOption };
