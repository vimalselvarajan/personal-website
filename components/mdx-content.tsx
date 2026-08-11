import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx-components";

export async function MdxContent({ source }: { source: string }) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: { parseFrontmatter: false, mdxOptions: { format: "mdx", remarkPlugins: [remarkGfm] } },
  });
  return <div className="prose-portfolio">{content}</div>;
}
