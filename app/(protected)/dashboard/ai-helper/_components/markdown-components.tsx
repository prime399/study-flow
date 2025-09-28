/**
 * Custom markdown components for rendering AI responses
 * Provides consistent styling and behavior for all markdown elements
 */

import { cn } from "@/lib/utils"
import type { Components } from "react-markdown"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

type CodeProps = ComponentPropsWithoutRef<'code'> & { inline?: boolean; children?: ReactNode }

export const markdownComponents: Components = {
  p: ({ node, ...props }) => (
    <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="ml-3 sm:ml-5 list-disc space-y-1 sm:space-y-1.5 text-xs sm:text-sm" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="ml-3 sm:ml-5 list-decimal space-y-1 sm:space-y-1.5 text-xs sm:text-sm" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="leading-relaxed text-xs sm:text-sm" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a
      className="font-medium text-primary underline decoration-muted-foreground/50 decoration-2 underline-offset-4 hover:text-primary/80"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="border-l-4 border-border pl-4 italic text-muted-foreground"
      {...props}
    />
  ),
  pre: ({ node, className, ...props }) => (
    <pre className={cn("markdown-pre", className)} {...props} />
  ),
  code: ({ inline, className, children, ...props }: CodeProps) => {
    if (inline) {
      return (
        <code
          className={cn(
            "rounded bg-muted px-1.5 py-0.5 font-mono text-xs",
            className,
          )}
          {...props}
        >
          {children}
        </code>
      )
    }

    return (
      <code
        className={cn("block font-mono text-sm leading-relaxed", className)}
        {...props}
      >
        {children}
      </code>
    )
  },
  table: ({ node, className, ...props }) => (
    <div className="markdown-table-wrapper overflow-x-auto -mx-1 sm:mx-0">
      <table
        className={cn("w-full border-collapse text-xs sm:text-sm min-w-full", className)}
        {...props}
      />
    </div>
  ),
  thead: ({ node, className, ...props }) => (
    <thead className={cn("bg-muted text-foreground", className)} {...props} />
  ),
  tbody: ({ node, className, ...props }) => (
    <tbody className={cn("divide-y divide-border", className)} {...props} />
  ),
  th: ({ node, className, ...props }) => (
    <th
      className={cn(
        "border-b border-border px-2 sm:px-3 py-1 sm:py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap",
        className,
      )}
      {...props}
    />
  ),
  td: ({ node, className, ...props }) => (
    <td className={cn("px-2 sm:px-3 py-1 sm:py-2 align-top text-xs sm:text-sm break-words", className)} {...props} />
  ),
}