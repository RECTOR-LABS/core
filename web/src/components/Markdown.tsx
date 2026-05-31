import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Mirror the Rails markdown() helper's renderer options
// (link_attributes: { target: "_blank", rel: "noopener" }): every rendered
// link opens in a new tab with rel="noopener", matching prod exactly.
const components: Components = {
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener">
        {children}
      </a>
    );
  },
};

// `className` is the prose wrapper. It defaults to the journal styling; the Work
// story page passes "story-content …" so the markdown nodes render as DIRECT
// children of .story-content — matching the Rails <div class="story-content">
// {markdown} structure so the `.story-content > h1:first-child` and footer
// direct-child rules bind correctly.
export function Markdown({
  children,
  className = "prose-journal",
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
