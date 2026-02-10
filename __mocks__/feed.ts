export class Feed {
  private options: any;
  private items: any[] = [];

  constructor(options: any) {
    this.options = options;
  }

  addItem(item: any) {
    this.items.push(item);
  }

  rss2() {
    return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>${this.options.title}</title>
    <language>${this.options.language}</language>
    <link>${this.options.link}</link>
    ${this.items
      .map(
        (item) => `
    <item>
      <title>${item.title}</title>
      <description>${item.description}</description>
      <link>${item.link}</link>
      <pubDate>${item.date.toUTCString()}</pubDate>
      ${item.category ? item.category.map((cat: any) => `<category>${cat.name}</category>`).join('') : ''}
      <content:encoded><![CDATA[${item.content}]]></content:encoded>
    </item>
    `
      )
      .join('')}
  </channel>
</rss>`;
  }

  atom1() {
    return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${this.options.title}</title>
  <id>${this.options.id}</id>
  <link href="${this.options.link}"/>
  ${this.items
    .map(
      (item) => `
  <entry>
    <title>${item.title}</title>
    <summary>${item.description}</summary>
    <content type="html">&lt;p&gt;${item.content.replace(/<[^>]*>/g, '')}&lt;/p&gt;</content>
  </entry>
  `
    )
    .join('')}
</feed>`;
  }
}
