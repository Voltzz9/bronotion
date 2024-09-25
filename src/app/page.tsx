import Image from "next/image";
import Head from "next/head";
import MarkdownPreview from "../components/markdown-editor";

export default function Home() {
  return (    <div>
    <Head>
      <title>Markdown Demo</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="UTF-8" />
    </Head>

    <main>
      <MarkdownPreview />
    </main>
  </div>
  );
}
