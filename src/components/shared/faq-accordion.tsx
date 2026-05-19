"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import type { Faq } from "@/types";

export function FAQAccordion({ items }: { items: Faq[] }) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-3">
      {items.map((item, i) => (
        <Accordion.Item
          key={item.question}
          value={`item-${i}`}
          className="rounded-xl border border-slate-200 bg-white px-4"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left text-sm font-medium text-slate-800">
              {item.question}
              <ChevronDown className="h-4 w-4 text-slate-500 transition group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pb-4 text-sm text-slate-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            {item.answer}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
