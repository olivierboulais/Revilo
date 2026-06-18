import { RawComponent, RawToken } from "@/lib/types";

// Stands in for: GET via GitHub API → component files / token files / docs /
// folder structure / package metadata / Storybook files in a React + TypeScript repo.
// Swap point: replace this function body with a real GitHub API client call
// (clone or fetch tree, parse component/token files) returning the same shape.

export async function fetchGithubComponents(): Promise<RawComponent[]> {
  return [
    { source: "github", name: "Button", path: "src/components/Button", variants: ["primary", "secondary", "ghost"], props: ["size", "disabled", "loading", "onClick"] },
    { source: "github", name: "Input", path: "src/components/Input", variants: ["default", "error"], props: ["placeholder", "value", "onChange"] },
    { source: "github", name: "Checkbox", path: "src/components/Checkbox", variants: ["unchecked", "checked", "indeterminate"], props: ["disabled", "onChange"] },
    { source: "github", name: "Select", path: "src/components/Select", variants: ["default", "open", "disabled"], props: ["options", "onSelect"] },
    { source: "github", name: "Modal", path: "src/components/Modal", variants: ["default"], props: ["title", "onClose"] },
    { source: "github", name: "Toast", path: "src/components/Toast", variants: ["success", "error", "warning", "info"], props: [] },
    { source: "github", name: "Badge", path: "src/components/Badge", variants: ["default", "success", "error", "warning"], props: [] },
    { source: "github", name: "Avatar", path: "src/components/Avatar", variants: ["sm", "md", "lg"], props: ["src", "initials"] },
    { source: "github", name: "Tooltip", path: "src/components/Tooltip", variants: ["top", "bottom", "left", "right"], props: [] },
    { source: "github", name: "Card", path: "src/components/Card", variants: ["default", "elevated"], props: [] },
    { source: "github", name: "Tabs", path: "src/components/Tabs", variants: ["default", "pills"], props: [] },
    { source: "github", name: "Accordion", path: "src/components/Accordion", variants: ["default"], props: [] },
    { source: "github", name: "Breadcrumb", path: "src/components/Breadcrumb", variants: ["default"], props: [] },
    { source: "github", name: "Pagination", path: "src/components/Pagination", variants: ["default", "compact"], props: [] },
    { source: "github", name: "ProgressBar", path: "src/components/ProgressBar", variants: ["default", "indeterminate"], props: [] },
    { source: "github", name: "Skeleton", path: "src/components/Skeleton", variants: ["text", "block"], props: [] },
    { source: "github", name: "DatePicker", path: "src/components/DatePicker", variants: ["default", "range"], props: [] },
    { source: "github", name: "Slider", path: "src/components/Slider", variants: ["default", "range"], props: [] },
    { source: "github", name: "Switch", path: "src/components/Switch", variants: ["default"], props: [] },
    { source: "github", name: "RadioGroup", path: "src/components/RadioGroup", variants: ["default"], props: [] },
    // Renamed across sources, matches the renamed Figma entries above
    { source: "github", name: "Alert", path: "src/components/Alert", variants: ["default"], props: [] },
    { source: "github", name: "Menu", path: "src/components/Menu", variants: ["default"], props: [] },
    // Code-only — should surface as "missing in design"
    { source: "github", name: "VirtualizedTable", path: "src/components/VirtualizedTable", variants: ["default"], props: [] },
    { source: "github", name: "ErrorBoundary", path: "src/components/ErrorBoundary", variants: ["default"], props: [] },
    { source: "github", name: "FeatureFlag", path: "src/components/FeatureFlag", variants: ["default"], props: [] },
    { source: "github", name: "AnalyticsProvider", path: "src/components/AnalyticsProvider", variants: ["default"], props: [] },
    // Deprecated component still referenced — should surface in adoption findings
    { source: "github", name: "ButtonLegacy", path: "src/components/deprecated/ButtonLegacy", variants: ["default"], props: [] },
    { source: "github", name: "ModalOld", path: "src/components/deprecated/ModalOld", variants: ["default"], props: [] },
    // Chaotic naming — should be flagged by component architecture checks
    { source: "github", name: "Button2", path: "src/components/Button2", variants: ["default"], props: [] },
    { source: "github", name: "CheckoutButtonFinal", path: "src/components/CheckoutButtonFinal", variants: ["default"], props: [] },
  ];
}

export async function fetchGithubTokens(): Promise<RawToken[]> {
  return [
    { source: "github", name: "color.blue.500", value: "#3B82F6", category: "color" },
    { source: "github", name: "color.gray.100", value: "#F3F4F6", category: "color" },
    { source: "github", name: "color.gray.900", value: "#111827", category: "color" },
    { source: "github", name: "color.red.500", value: "#EF4444", category: "color" },
    { source: "github", name: "color.green.500", value: "#22C55E", category: "color" },
    { source: "github", name: "space.1", value: "4px", category: "spacing" },
    { source: "github", name: "space.2", value: "8px", category: "spacing" },
    { source: "github", name: "space.4", value: "16px", category: "spacing" },
    { source: "github", name: "space.8", value: "32px", category: "spacing" },
    { source: "github", name: "radius.sm", value: "4px", category: "radius" },
    { source: "github", name: "radius.md", value: "8px", category: "radius" },
    { source: "github", name: "radius.lg", value: "16px", category: "radius" },
    { source: "github", name: "color.text.default", value: "#111827", category: "color" },
    { source: "github", name: "color.text.muted", value: "#6B7280", category: "color" },
    { source: "github", name: "color.action.primary.background", value: "#3B82F6", category: "color" },
    { source: "github", name: "color.surface.default", value: "#FFFFFF", category: "color" },
    // Same value as figma's "color.brand.primary", different name → token naming mismatch
    { source: "github", name: "color.purple.primary", value: "#7C3AED", category: "color" },
    // Same name as figma's "color.border.default", different value → token value mismatch
    { source: "github", name: "color.border.default", value: "#D1D5DB", category: "color" },
    // Raw hardcoded values used directly in components instead of tokens —
    // surfaced as "category": "hardcoded" so the comparison layer can flag them
    { source: "github", name: "hardcoded:CheckoutButtonFinal:background", value: "#6D28D9", category: "hardcoded" },
    { source: "github", name: "hardcoded:Button2:padding", value: "10px 18px", category: "hardcoded" },
    { source: "github", name: "hardcoded:VirtualizedTable:border", value: "1px solid #ccc", category: "hardcoded" },
  ];
}
