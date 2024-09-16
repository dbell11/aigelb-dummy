import React from "react";
import { ArrowSquareOut } from "@phosphor-icons/react";

// Define types for the props of each component
type CommonProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

type LinkProps = CommonProps & {
  href?: string;
};

type CodeProps = CommonProps & {
  inline?: boolean;
  className?: string;
};

const MarkdownComponents: { [elemName: string]: React.ComponentType<any> } = {
  h1: ({ children, ...props }: CommonProps) => (
    <h1 className="mb-2 text-white font-semibold text-xl" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: CommonProps) => (
    <h2 className="mb-2 text-white font-semibold text-lg" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: CommonProps) => (
    <h3 className="mb-2 text-white font-semibold text-lg" {...props}>
      {children}
    </h3>
  ),
  hr: (props: CommonProps) => <hr className="border-white/70" {...props} />,
  p: ({ children, ...props }: CommonProps) => (
    <p className="mb-2 text-white last:mb-0" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: CommonProps) => (
    <ul className="list-disc pl-4 mb-2 text-white" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: CommonProps) => (
    <ol className="list-decimal pl-4 mb-2 text-white" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: CommonProps) => (
    <li className="mb-1" {...props}>
      {children}
    </li>
  ),
  a: ({ href, children, ...props }: LinkProps) => (
    <a
      className="text inline-flex items-center font-semibold xl:transition-opacity xl:hover:opacity-90"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      <ArrowSquareOut
        size={20}
        weight="bold"
        className="mr-1 self-start flex-shrink-0 pt-[3px]"
      />
      {children}
    </a>
  ),
  code: ({ inline, className, children, ...props }: CodeProps) =>
    inline ? (
      <code className="bg-gray-700 rounded px-1" {...props}>
        {children}
      </code>
    ) : (
      <code
        className="block bg-gray-700 rounded p-2 my-2 whitespace-pre-wrap"
        {...props}
      >
        {children}
      </code>
    ),
  table: ({ children, ...props }: CommonProps) => (
    <div className="overflow-x-auto my-4 rounded-md shadow-xl mb-5 border border-gray-950/10">
      <table className="min-w-full bg-white/10 text-white text-sm " {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: CommonProps) => (
    <thead className="bg-black text-white" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: CommonProps) => (
    <tbody className="divide-y divide-gray-950/20" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: CommonProps) => (
    <tr className="" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: CommonProps) => (
    <th className="px-4 py-2 text-left font-semibold align-top" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: CommonProps) => (
    <td className="px-4 py-2 align-top" {...props}>
      {children}
    </td>
  ),
};

export default MarkdownComponents;
