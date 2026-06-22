import { RawComponent, RawToken, RawDesignUsageSignal } from "@/lib/types";

// Stands in for: GET via Figma API → files / libraries / components /
// component sets / variants / variables / styles.
// Swap point: replace this function body with a real Figma API client call
// that returns the same RawComponent[] / RawToken[] shape.

export async function fetchFigmaComponents(): Promise<RawComponent[]> {
  return [
    { source: "figma", name: "Button", path: "Foundations/Actions", variants: ["primary", "secondary", "ghost", "danger"], props: ["size", "disabled", "loading"] },
    { source: "figma", name: "Input", path: "Foundations/Forms", variants: ["default", "error", "disabled"], props: ["placeholder", "value"] },
    { source: "figma", name: "Checkbox", path: "Foundations/Forms", variants: ["unchecked", "checked", "indeterminate"], props: ["disabled"] },
    { source: "figma", name: "Select", path: "Foundations/Forms", variants: ["default", "open", "disabled"], props: ["options"] },
    { source: "figma", name: "Modal", path: "Foundations/Overlays", variants: ["default", "fullscreen"], props: ["title"] },
    { source: "figma", name: "Toast", path: "Foundations/Feedback", variants: ["success", "error", "warning", "info"], props: [] },
    { source: "figma", name: "Badge", path: "Foundations/Indicators", variants: ["default", "success", "error", "warning"], props: [] },
    { source: "figma", name: "Avatar", path: "Foundations/Media", variants: ["sm", "md", "lg"], props: ["src", "initials"] },
    { source: "figma", name: "Tooltip", path: "Foundations/Overlays", variants: ["top", "bottom", "left", "right"], props: [] },
    { source: "figma", name: "Card", path: "Foundations/Surfaces", variants: ["default", "elevated"], props: [] },
    { source: "figma", name: "Tabs", path: "Foundations/Navigation", variants: ["default", "pills"], props: [] },
    { source: "figma", name: "Accordion", path: "Foundations/Disclosure", variants: ["default"], props: [] },
    { source: "figma", name: "Breadcrumb", path: "Foundations/Navigation", variants: ["default"], props: [] },
    { source: "figma", name: "Pagination", path: "Foundations/Navigation", variants: ["default", "compact"], props: [] },
    { source: "figma", name: "ProgressBar", path: "Foundations/Feedback", variants: ["default", "indeterminate"], props: [] },
    { source: "figma", name: "Skeleton", path: "Foundations/Feedback", variants: ["text", "block", "circle"], props: [] },
    { source: "figma", name: "DatePicker", path: "Foundations/Forms", variants: ["default", "range"], props: [] },
    { source: "figma", name: "Slider", path: "Foundations/Forms", variants: ["default", "range"], props: [] },
    { source: "figma", name: "Switch", path: "Foundations/Forms", variants: ["default"], props: [] },
    { source: "figma", name: "RadioGroup", path: "Foundations/Forms", variants: ["default"], props: [] },
    // Figma-only — should surface as "missing in code"
    { source: "figma", name: "EmptyState", path: "Foundations/Feedback", variants: ["default", "search", "error"], props: [] },
    { source: "figma", name: "Stepper", path: "Foundations/Navigation", variants: ["default"], props: [] },
    { source: "figma", name: "CommandPalette", path: "Foundations/Overlays", variants: ["default"], props: [] },
    { source: "figma", name: "Rating", path: "Foundations/Forms", variants: ["default", "readonly"], props: [] },
    // Renamed across sources — should surface as "likely same but named differently"
    { source: "figma", name: "Notification", path: "Foundations/Feedback", variants: ["default"], props: [] },
    { source: "figma", name: "DropdownMenu", path: "Foundations/Overlays", variants: ["default"], props: [] },
  ];
}

export async function fetchFigmaTokens(): Promise<RawToken[]> {
  return [
    // Primitives — well-formed
    { source: "figma", name: "color.blue.500", value: "#3B82F6", category: "color" },
    { source: "figma", name: "color.gray.100", value: "#F3F4F6", category: "color" },
    { source: "figma", name: "color.gray.900", value: "#111827", category: "color" },
    { source: "figma", name: "color.red.500", value: "#EF4444", category: "color" },
    { source: "figma", name: "color.green.500", value: "#22C55E", category: "color" },
    { source: "figma", name: "space.1", value: "4px", category: "spacing" },
    { source: "figma", name: "space.2", value: "8px", category: "spacing" },
    { source: "figma", name: "space.4", value: "16px", category: "spacing" },
    { source: "figma", name: "space.8", value: "32px", category: "spacing" },
    { source: "figma", name: "radius.sm", value: "4px", category: "radius" },
    { source: "figma", name: "radius.md", value: "8px", category: "radius" },
    { source: "figma", name: "radius.lg", value: "16px", category: "radius" },
    // Semantic layer — present but incomplete
    { source: "figma", name: "color.text.default", value: "#111827", category: "color" },
    { source: "figma", name: "color.text.muted", value: "#6B7280", category: "color" },
    { source: "figma", name: "color.action.primary.background", value: "#3B82F6", category: "color" },
    { source: "figma", name: "color.surface.default", value: "#FFFFFF", category: "color" },
    // Poorly named primitives — should be flagged by architecture checks
    { source: "figma", name: "homepage-purple", value: "#7C3AED", category: "color" },
    { source: "figma", name: "checkout-padding", value: "24px", category: "spacing" },
    { source: "figma", name: "card-shadow-blue", value: "0 4px 12px rgba(59,130,246,0.15)", category: "shadow" },
    // Same value, different name vs. code — token naming mismatch
    { source: "figma", name: "color.brand.primary", value: "#7C3AED", category: "color" },
    // Same name, different value vs. code — token value mismatch
    { source: "figma", name: "color.border.default", value: "#E5E7EB", category: "color" },
  ];
}

// Stands in for: scanning Figma file content (not the library) for instances
// that have been detached from their source component, and styles/variables
// applied directly rather than through the shared library. Swap point:
// replace with a real Figma API call that walks file nodes for
// `componentId === null` on what were instances, and local paint/text styles.
export async function fetchFigmaUsageSignals(): Promise<RawDesignUsageSignal[]> {
  return [
    { type: "detached_instance", componentName: "Button", fileName: "Checkout Redesign", description: "A Button instance was detached and manually restyled with a custom shadow." },
    { type: "detached_instance", componentName: "Card", fileName: "Marketing Landing v3", description: "A Card instance was detached to add a gradient border not supported by the library version." },
    { type: "detached_instance", componentName: "Modal", fileName: "Onboarding Flow", description: "A Modal instance was detached to change its corner radius for a one-off screen." },
    { type: "local_style", fileName: "Checkout Redesign", description: "A local color style (#6D28D9) was applied directly instead of referencing color.brand.primary." },
    { type: "local_style", fileName: "Marketing Landing v3", description: "A local text style was used instead of the shared typography scale." },
    { type: "local_variable", fileName: "Onboarding Flow", description: "A local spacing variable was created instead of reusing an existing primitive token." },
  ];
}
