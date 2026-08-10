// Eval fixture: a component the detector should pass with zero critical/serious findings.
import { useState } from "react";

type Plan = { id: string; name: string; priceLabel: string };

export function PlanPicker({ plans, onSelect }: { plans: Plan[]; onSelect: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  function choose(id: string) {
    setSelected(id);
    onSelect(id);
  }

  return (
    <section aria-labelledby="plans-heading" className="plans">
      <h2 id="plans-heading">Choose a plan</h2>
      <ul role="list">
        {plans.map((plan) => (
          <li key={plan.id}>
            <button
              type="button"
              aria-pressed={selected === plan.id}
              onClick={() => choose(plan.id)}
              className="plan-option"
            >
              <span className="plan-name">{plan.name}</span>
              <span className="plan-price">{plan.priceLabel}</span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" aria-label="Close plan picker" className="plan-close">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      <img src="/img/plans-overview.png" alt="Comparison of plan features" width="640" height="360" loading="lazy" />
      <style>{`
        .plans { min-height: 100dvh; padding-block: var(--space-8); }
        .plan-option {
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          transition: border-color 150ms ease, background-color 150ms ease;
        }
        .plan-option:hover { background-color: var(--surface-hover); }
        .plan-option:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
        .plan-option[aria-pressed="true"] { border-color: var(--accent); }
        .plan-close:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .plan-option { transition: none; }
        }
      `}</style>
    </section>
  );
}
