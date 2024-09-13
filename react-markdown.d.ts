declare module "react-markdown" {
  import React from "react";

  interface ReactMarkdownProps {
    children: string;
    components?: {
      [elemName: string]: React.ComponentType<any>;
    };
    remarkPlugins?: any[];
    rehypePlugins?: any[];
  }

  export default class ReactMarkdown extends React.Component<ReactMarkdownProps> {}
}
