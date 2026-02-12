interface RichTextWidgetProps {
  content: string;
}

export const RichTextWidget = ({ content }: RichTextWidgetProps) => {
  // 簡易 Markdown → HTML 轉換 (僅支援基本語法)
  const renderMarkdown = (text: string) => {
    return text
      .split('\n\n')
      .map((paragraph, i) => {
        // Heading
        const h2Match = paragraph.match(/^## (.+)$/);
        if (h2Match) {
          return (
            <h2
              key={i}
              className="text-xl font-bold text-text-primary mb-4"
            >
              {h2Match[1]}
            </h2>
          );
        }

        const h3Match = paragraph.match(/^### (.+)$/);
        if (h3Match) {
          return (
            <h3
              key={i}
              className="text-lg font-semibold text-text-primary mb-3"
            >
              {h3Match[1]}
            </h3>
          );
        }

        // Regular paragraph
        return (
          <p
            key={i}
            className="text-text-secondary leading-relaxed mb-4 last:mb-0"
          >
            {paragraph}
          </p>
        );
      });
  };

  return <div className="prose-cjk">{renderMarkdown(content)}</div>;
};
