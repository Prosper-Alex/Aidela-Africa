// Key feature: Provides a polished multi-value input for candidate tech stacks.
import { Plus, X } from "lucide-react";
import { useState } from "react";

const normalizeStack = (value) => `${value || ""}`.trim().replace(/\s+/g, " ");

const hasDuplicate = (stacks, value) =>
  stacks.some((item) => item.toLowerCase() === value.toLowerCase());

const TechStackInput = ({
  value = [],
  onChange,
  label = "Tech stack",
  placeholder = "React, Node.js, Python",
  maxStacks = 12,
  className = "",
}) => {
  const stacks = Array.isArray(value) ? value : [];
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState("");

  const updateStacks = (nextStacks) => {
    onChange?.(nextStacks);
  };

  const addStack = (rawValue = inputValue) => {
    const nextStack = normalizeStack(rawValue);

    if (!nextStack) {
      setInputValue("");
      setFeedback("");
      return;
    }

    if (stacks.length >= maxStacks) {
      setFeedback(`You can add up to ${maxStacks} stacks.`);
      return;
    }

    if (hasDuplicate(stacks, nextStack)) {
      setFeedback(`${nextStack} is already listed.`);
      setInputValue("");
      return;
    }

    updateStacks([...stacks, nextStack]);
    setInputValue("");
    setFeedback("");
  };

  const removeStack = (stackToRemove) => {
    updateStacks(stacks.filter((stack) => stack !== stackToRemove));
    setFeedback("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addStack();
      return;
    }

    if (event.key === "Backspace" && !inputValue && stacks.length > 0) {
      updateStacks(stacks.slice(0, -1));
    }
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value;

    if (nextValue.includes(",")) {
      const [firstValue, ...remainingValues] = nextValue.split(",");
      addStack(firstValue);
      setInputValue(remainingValues.join(",").trimStart());
      return;
    }

    setInputValue(nextValue);
    setFeedback("");
  };

  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-medium text-slate-700">{label}</span>

      <div className="rounded-xl bg-slate-50/80 p-2 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)] transition focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(6,73,181,0.10),inset_0_0_0_1px_rgba(6,73,181,0.22)]">
        <div className="flex min-h-12 flex-wrap items-center gap-2">
          {stacks.map((stack) => (
            <span
              key={stack}
              className="group inline-flex max-w-full items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-[0_1px_6px_rgba(15,23,42,0.06),inset_0_0_0_1px_rgba(148,163,184,0.14)] transition duration-200 hover:-translate-y-px hover:text-slate-950 hover:shadow-[0_8px_18px_rgba(15,23,42,0.09),inset_0_0_0_1px_rgba(6,73,181,0.16)]"
            >
              <span className="truncate">{stack}</span>
              <button
                type="button"
                onClick={() => removeStack(stack)}
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={`Remove ${stack}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}

          <input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={stacks.length ? "Add another" : placeholder}
            className="min-h-9 min-w-[9rem] flex-1 bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={() => addStack()}
            disabled={!inputValue.trim() || stacks.length >= maxStacks}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-secondary-accent disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{feedback || "Press Enter or comma to add a stack."}</span>
        <span className="shrink-0">
          {stacks.length}/{maxStacks}
        </span>
      </div>
    </label>
  );
};

export default TechStackInput;
