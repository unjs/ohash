// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { serialize } from "../src";

describe("serialize (DOM)", () => {
  describe("Basic HTML elements", () => {
    it("HTMLDivElement", () => {
      const div = document.createElement("div");
      expect(serialize(div)).toMatchInlineSnapshot(
        `"HTMLDivElement(<div></div>)"`,
      );
    });

    it("HTMLSpanElement", () => {
      const span = document.createElement("span");
      expect(serialize(span)).toMatchInlineSnapshot(
        `"HTMLSpanElement(<span></span>)"`,
      );
    });

    it("HTMLAnchorElement", () => {
      const a = document.createElement("a");
      expect(serialize(a)).toMatchInlineSnapshot(
        `"HTMLAnchorElement(<a></a>)"`,
      );
    });

    it("HTMLParagraphElement", () => {
      const p = document.createElement("p");
      expect(serialize(p)).toMatchInlineSnapshot(
        `"HTMLParagraphElement(<p></p>)"`,
      );
    });

    it("HTMLPreElement", () => {
      const pre = document.createElement("pre");
      expect(serialize(pre)).toMatchInlineSnapshot(
        `"HTMLPreElement(<pre></pre>)"`,
      );
    });

    it("HTMLCodeElement", () => {
      const code = document.createElement("code");
      expect(serialize(code)).toMatchInlineSnapshot(
        `"HTMLElement(<code></code>)"`,
      );
    });

    it("HTMLHRElement", () => {
      const hr = document.createElement("hr");
      expect(serialize(hr)).toMatchInlineSnapshot(`"HTMLHRElement(<hr>)"`);
    });

    it("HTMLBRElement", () => {
      const br = document.createElement("br");
      expect(serialize(br)).toMatchInlineSnapshot(`"HTMLBRElement(<br>)"`);
    });
  });

  describe("Form elements", () => {
    it("HTMLInputElement", () => {
      const input = document.createElement("input");
      expect(serialize(input)).toMatchInlineSnapshot(
        `"HTMLInputElement(<input>)"`,
      );
    });

    it("HTMLButtonElement", () => {
      const button = document.createElement("button");
      expect(serialize(button)).toMatchInlineSnapshot(
        `"HTMLButtonElement(<button></button>)"`,
      );
    });

    it("HTMLSelectElement", () => {
      const select = document.createElement("select");
      expect(serialize(select)).toMatchInlineSnapshot(
        `"HTMLSelectElement(<select></select>)"`,
      );
    });

    it("HTMLTextAreaElement", () => {
      const textarea = document.createElement("textarea");
      expect(serialize(textarea)).toMatchInlineSnapshot(
        `"HTMLTextAreaElement(<textarea></textarea>)"`,
      );
    });

    it("HTMLFormElement", () => {
      const form = document.createElement("form");
      expect(serialize(form)).toMatchInlineSnapshot(
        `"HTMLFormElement(<form></form>)"`,
      );
    });

    it("HTMLLabelElement", () => {
      const label = document.createElement("label");
      expect(serialize(label)).toMatchInlineSnapshot(
        `"HTMLLabelElement(<label></label>)"`,
      );
    });

    it("HTMLFieldSetElement", () => {
      const fieldset = document.createElement("fieldset");
      expect(serialize(fieldset)).toMatchInlineSnapshot(
        `"HTMLFieldSetElement(<fieldset></fieldset>)"`,
      );
    });

    it("HTMLLegendElement", () => {
      const legend = document.createElement("legend");
      expect(serialize(legend)).toMatchInlineSnapshot(
        `"HTMLLegendElement(<legend></legend>)"`,
      );
    });

    it("HTMLOptionElement", () => {
      const option = document.createElement("option");
      expect(serialize(option)).toMatchInlineSnapshot(
        `"HTMLOptionElement(<option></option>)"`,
      );
    });

    it("HTMLOptGroupElement", () => {
      const optgroup = document.createElement("optgroup");
      expect(serialize(optgroup)).toMatchInlineSnapshot(
        `"HTMLOptGroupElement(<optgroup></optgroup>)"`,
      );
    });

    it("HTMLDataListElement", () => {
      const datalist = document.createElement("datalist");
      expect(serialize(datalist)).toMatchInlineSnapshot(
        `"HTMLDataListElement(<datalist></datalist>)"`,
      );
    });
  });

  describe("Media elements", () => {
    it("HTMLImageElement", () => {
      const img = document.createElement("img");
      expect(serialize(img)).toMatchInlineSnapshot(`"HTMLImageElement(<img>)"`);
    });

    it("HTMLAudioElement", () => {
      const audio = document.createElement("audio");
      expect(serialize(audio)).toMatchInlineSnapshot(
        `"HTMLAudioElement(<audio></audio>)"`,
      );
    });

    it("HTMLVideoElement", () => {
      const video = document.createElement("video");
      expect(serialize(video)).toMatchInlineSnapshot(
        `"HTMLVideoElement(<video></video>)"`,
      );
    });

    it("HTMLCanvasElement", () => {
      const canvas = document.createElement("canvas");
      expect(serialize(canvas)).toMatchInlineSnapshot(
        `"HTMLCanvasElement(<canvas></canvas>)"`,
      );
    });

    it("HTMLIFrameElement", () => {
      const iframe = document.createElement("iframe");
      expect(serialize(iframe)).toMatchInlineSnapshot(
        `"HTMLIFrameElement(<iframe></iframe>)"`,
      );
    });

    it("HTMLObjectElement", () => {
      const object = document.createElement("object");
      expect(serialize(object)).toMatchInlineSnapshot(
        `"HTMLObjectElement(<object></object>)"`,
      );
    });
  });

  describe("Document structure elements", () => {
    it("HTMLScriptElement", () => {
      const script = document.createElement("script");
      expect(serialize(script)).toMatchInlineSnapshot(
        `"HTMLScriptElement(<script></script>)"`,
      );
    });

    it("HTMLStyleElement", () => {
      const style = document.createElement("style");
      expect(serialize(style)).toMatchInlineSnapshot(
        `"HTMLStyleElement(<style></style>)"`,
      );
    });

    it("HTMLLinkElement", () => {
      const link = document.createElement("link");
      expect(serialize(link)).toMatchInlineSnapshot(
        `"HTMLLinkElement(<link>)"`,
      );
    });

    it("HTMLMetaElement", () => {
      const meta = document.createElement("meta");
      expect(serialize(meta)).toMatchInlineSnapshot(
        `"HTMLMetaElement(<meta>)"`,
      );
    });

    it("HTMLTitleElement", () => {
      const title = document.createElement("title");
      expect(serialize(title)).toMatchInlineSnapshot(
        `"HTMLTitleElement(<title></title>)"`,
      );
    });

    it("HTMLHeadElement", () => {
      const head = document.createElement("head");
      expect(serialize(head)).toMatchInlineSnapshot(
        `"HTMLHeadElement(<head></head>)"`,
      );
    });

    it("HTMLBodyElement", () => {
      const body = document.createElement("body");
      expect(serialize(body)).toMatchInlineSnapshot(
        `"HTMLBodyElement(<body></body>)"`,
      );
    });

    it("HTMLHtmlElement", () => {
      const html = document.createElement("html");
      expect(serialize(html)).toMatchInlineSnapshot(
        `"HTMLHtmlElement(<html></html>)"`,
      );
    });
  });

  describe("Table elements", () => {
    it("HTMLTableElement", () => {
      const table = document.createElement("table");
      expect(serialize(table)).toMatchInlineSnapshot(
        `"HTMLTableElement(<table></table>)"`,
      );
    });

    it("HTMLTableRowElement", () => {
      const tr = document.createElement("tr");
      expect(serialize(tr)).toMatchInlineSnapshot(
        `"HTMLTableRowElement(<tr></tr>)"`,
      );
    });

    it("HTMLTableCellElement (td)", () => {
      const td = document.createElement("td");
      expect(serialize(td)).toMatchInlineSnapshot(
        `"HTMLTableCellElement(<td></td>)"`,
      );
    });

    it("HTMLTableCellElement (th)", () => {
      const th = document.createElement("th");
      expect(serialize(th)).toMatchInlineSnapshot(
        `"HTMLTableCellElement(<th></th>)"`,
      );
    });

    it("HTMLTableSectionElement", () => {
      const thead = document.createElement("thead");
      expect(serialize(thead)).toMatchInlineSnapshot(
        `"HTMLTableSectionElement(<thead></thead>)"`,
      );
    });

    it("HTMLTableCaptionElement", () => {
      const caption = document.createElement("caption");
      expect(serialize(caption)).toMatchInlineSnapshot(
        `"HTMLTableCaptionElement(<caption></caption>)"`,
      );
    });

    it("HTMLTableColElement (col)", () => {
      const col = document.createElement("col");
      expect(serialize(col)).toMatchInlineSnapshot(
        `"HTMLTableColElement(<col>)"`,
      );
    });

    it("HTMLTableColElement (colgroup)", () => {
      const colgroup = document.createElement("colgroup");
      expect(serialize(colgroup)).toMatchInlineSnapshot(
        `"HTMLTableColElement(<colgroup></colgroup>)"`,
      );
    });
  });

  describe("Heading elements", () => {
    it("HTMLHeadingElement (h1)", () => {
      const h1 = document.createElement("h1");
      expect(serialize(h1)).toMatchInlineSnapshot(
        `"HTMLHeadingElement(<h1></h1>)"`,
      );
    });

    it("HTMLHeadingElement (h2)", () => {
      const h2 = document.createElement("h2");
      expect(serialize(h2)).toMatchInlineSnapshot(
        `"HTMLHeadingElement(<h2></h2>)"`,
      );
    });

    it("HTMLHeadingElement (h3)", () => {
      const h3 = document.createElement("h3");
      expect(serialize(h3)).toMatchInlineSnapshot(
        `"HTMLHeadingElement(<h3></h3>)"`,
      );
    });

    it("HTMLHeadingElement (h4)", () => {
      const h4 = document.createElement("h4");
      expect(serialize(h4)).toMatchInlineSnapshot(
        `"HTMLHeadingElement(<h4></h4>)"`,
      );
    });

    it("HTMLHeadingElement (h5)", () => {
      const h5 = document.createElement("h5");
      expect(serialize(h5)).toMatchInlineSnapshot(
        `"HTMLHeadingElement(<h5></h5>)"`,
      );
    });

    it("HTMLHeadingElement (h6)", () => {
      const h6 = document.createElement("h6");
      expect(serialize(h6)).toMatchInlineSnapshot(
        `"HTMLHeadingElement(<h6></h6>)"`,
      );
    });
  });

  describe("List elements", () => {
    it("HTMLUListElement", () => {
      const ul = document.createElement("ul");
      expect(serialize(ul)).toMatchInlineSnapshot(
        `"HTMLUListElement(<ul></ul>)"`,
      );
    });

    it("HTMLOListElement", () => {
      const ol = document.createElement("ol");
      expect(serialize(ol)).toMatchInlineSnapshot(
        `"HTMLOListElement(<ol></ol>)"`,
      );
    });

    it("HTMLLIElement", () => {
      const li = document.createElement("li");
      expect(serialize(li)).toMatchInlineSnapshot(`"HTMLLIElement(<li></li>)"`);
    });

    it("HTMLDListElement", () => {
      const dl = document.createElement("dl");
      expect(serialize(dl)).toMatchInlineSnapshot(
        `"HTMLDListElement(<dl></dl>)"`,
      );
    });

    it("HTMLDTElement", () => {
      const dt = document.createElement("dt");
      expect(serialize(dt)).toMatchInlineSnapshot(`"HTMLElement(<dt></dt>)"`);
    });

    it("HTMLDDElement", () => {
      const dd = document.createElement("dd");
      expect(serialize(dd)).toMatchInlineSnapshot(`"HTMLElement(<dd></dd>)"`);
    });
  });

  describe("Semantic elements", () => {
    it("HTMLElement (header)", () => {
      const header = document.createElement("header");
      expect(serialize(header)).toMatchInlineSnapshot(
        `"HTMLElement(<header></header>)"`,
      );
    });

    it("HTMLElement (footer)", () => {
      const footer = document.createElement("footer");
      expect(serialize(footer)).toMatchInlineSnapshot(
        `"HTMLElement(<footer></footer>)"`,
      );
    });

    it("HTMLElement (nav)", () => {
      const nav = document.createElement("nav");
      expect(serialize(nav)).toMatchInlineSnapshot(
        `"HTMLElement(<nav></nav>)"`,
      );
    });

    it("HTMLElement (main)", () => {
      const main = document.createElement("main");
      expect(serialize(main)).toMatchInlineSnapshot(
        `"HTMLElement(<main></main>)"`,
      );
    });

    it("HTMLElement (section)", () => {
      const section = document.createElement("section");
      expect(serialize(section)).toMatchInlineSnapshot(
        `"HTMLElement(<section></section>)"`,
      );
    });

    it("HTMLElement (article)", () => {
      const article = document.createElement("article");
      expect(serialize(article)).toMatchInlineSnapshot(
        `"HTMLElement(<article></article>)"`,
      );
    });

    it("HTMLElement (aside)", () => {
      const aside = document.createElement("aside");
      expect(serialize(aside)).toMatchInlineSnapshot(
        `"HTMLElement(<aside></aside>)"`,
      );
    });

    it("HTMLElement (figure)", () => {
      const figure = document.createElement("figure");
      expect(serialize(figure)).toMatchInlineSnapshot(
        `"HTMLElement(<figure></figure>)"`,
      );
    });

    it("HTMLElement (figcaption)", () => {
      const figcaption = document.createElement("figcaption");
      expect(serialize(figcaption)).toMatchInlineSnapshot(
        `"HTMLElement(<figcaption></figcaption>)"`,
      );
    });
  });

  describe("Text formatting elements", () => {
    it("HTMLElement (em)", () => {
      const em = document.createElement("em");
      expect(serialize(em)).toMatchInlineSnapshot(`"HTMLElement(<em></em>)"`);
    });

    it("HTMLElement (strong)", () => {
      const strong = document.createElement("strong");
      expect(serialize(strong)).toMatchInlineSnapshot(
        `"HTMLElement(<strong></strong>)"`,
      );
    });

    it("HTMLElement (small)", () => {
      const small = document.createElement("small");
      expect(serialize(small)).toMatchInlineSnapshot(
        `"HTMLElement(<small></small>)"`,
      );
    });

    it("HTMLElement (mark)", () => {
      const mark = document.createElement("mark");
      expect(serialize(mark)).toMatchInlineSnapshot(
        `"HTMLElement(<mark></mark>)"`,
      );
    });

    it("HTMLElement (del)", () => {
      const del = document.createElement("del");
      expect(serialize(del)).toMatchInlineSnapshot(
        `"HTMLModElement(<del></del>)"`,
      );
    });

    it("HTMLElement (ins)", () => {
      const ins = document.createElement("ins");
      expect(serialize(ins)).toMatchInlineSnapshot(
        `"HTMLModElement(<ins></ins>)"`,
      );
    });

    it("HTMLElement (sub)", () => {
      const sub = document.createElement("sub");
      expect(serialize(sub)).toMatchInlineSnapshot(
        `"HTMLElement(<sub></sub>)"`,
      );
    });

    it("HTMLElement (sup)", () => {
      const sup = document.createElement("sup");
      expect(serialize(sup)).toMatchInlineSnapshot(
        `"HTMLElement(<sup></sup>)"`,
      );
    });

    it("HTMLElement (blockquote)", () => {
      const blockquote = document.createElement("blockquote");
      expect(serialize(blockquote)).toMatchInlineSnapshot(
        `"HTMLQuoteElement(<blockquote></blockquote>)"`,
      );
    });

    it("HTMLElement (cite)", () => {
      const cite = document.createElement("cite");
      expect(serialize(cite)).toMatchInlineSnapshot(
        `"HTMLElement(<cite></cite>)"`,
      );
    });

    it("HTMLElement (q)", () => {
      const q = document.createElement("q");
      expect(serialize(q)).toMatchInlineSnapshot(`"HTMLQuoteElement(<q></q>)"`);
    });

    it("HTMLElement (abbr)", () => {
      const abbr = document.createElement("abbr");
      expect(serialize(abbr)).toMatchInlineSnapshot(
        `"HTMLElement(<abbr></abbr>)"`,
      );
    });

    it("HTMLElement (address)", () => {
      const address = document.createElement("address");
      expect(serialize(address)).toMatchInlineSnapshot(
        `"HTMLElement(<address></address>)"`,
      );
    });
  });

  describe("Other", () => {
    it("HTMLTimeElement", () => {
      const time = document.createElement("time");
      expect(serialize(time)).toMatchInlineSnapshot(
        `"HTMLTimeElement(<time></time>)"`,
      );
    });

    it("HTMLProgressElement", () => {
      const progress = document.createElement("progress");
      expect(serialize(progress)).toMatchInlineSnapshot(
        `"HTMLProgressElement(<progress></progress>)"`,
      );
    });

    it("HTMLCollection", () => {
      const div = document.createElement("div");
      div.innerHTML = "<span>hello</span><span>world</span>";
      const collection = div.children;
      expect(serialize(collection)).toMatchInlineSnapshot(
        `"HTMLCollection[HTMLSpanElement(<span>hello</span>),HTMLSpanElement(<span>world</span>)]"`,
      );
    });

    it("HTMLDocument", () => {
      const doc = document;
      expect(serialize(doc)).toMatchInlineSnapshot(
        `"HTMLDocument[HTMLHtmlElement(<html><head></head><body></body></html>)]"`,
      );
    });

    it("DocumentFragment", () => {
      const fragment = document.createDocumentFragment();
      fragment.append(document.createElement("div"));
      fragment.append(document.createElement("input"));
      expect(serialize(fragment)).toMatchInlineSnapshot(
        `"DocumentFragment[HTMLDivElement(<div></div>),HTMLInputElement(<input>)]"`,
      );
    });

    it("Text", () => {
      const text = document.createTextNode("Hello");
      expect(serialize(text)).toMatchInlineSnapshot(`"Text('Hello')"`);
    });

    it("Comment", () => {
      const comment = document.createComment("Hello");
      expect(serialize(comment)).toMatchInlineSnapshot(`"Comment('Hello')"`);
    });

    it("NodeList", () => {
      const div = document.createElement("div");
      div.innerHTML = "<span>hello</span><span>world</span>";
      const nodeList = div.querySelectorAll("span");
      expect(serialize(nodeList)).toMatchInlineSnapshot(
        `"NodeList[HTMLSpanElement(<span>hello</span>),HTMLSpanElement(<span>world</span>)]"`,
      );
    });

    it("Range", () => {
      const range = document.createRange();
      const body = document.createElement("body");
      body.innerHTML = "<div>hello</div><div>world</div>";
      range.setStart(body.firstChild!.firstChild!, 1);
      range.setEnd(body.lastChild!.firstChild!, 3);
      expect(serialize(range)).toMatchInlineSnapshot(
        `"Range(Text('hello'):1,Text('world'):3)"`,
      );
    });
  });
});
