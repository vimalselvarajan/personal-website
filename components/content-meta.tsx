import { Badge } from "@/components/ui/badge";

export function ContentMeta({ items }: { items: Array<{ label: string; value: string | string[] }> }) {
  return (
    <dl className="grid gap-x-8 gap-y-6 border-y border-border py-7 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">{item.label}</dt>
          <dd className="mt-2 text-sm leading-6 text-foreground">
            {Array.isArray(item.value) ? <span className="flex flex-wrap gap-2">{item.value.map((value) => <Badge key={value}>{value}</Badge>)}</span> : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
