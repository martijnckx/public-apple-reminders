function sanitiseHtml(input) {
    var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
    };
  
    var sanitisedInput = String(input).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  
    return sanitisedInput;
  }
  
  function md(markdown, withParagraphs = false) {
    // Convert bold and italic text
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    markdown = markdown.replace(/\*(.*?)\*/g, "<em>$1</em>");
    markdown = markdown.replace(
      /\~(.*?)\~/g,
      '<span style="text-decoration: underline">$1</span>'
    );
  
    // Convert lists
    markdown = markdown.replace(/^\-\s(.*)$/gm, "<ul><li>$1</li></ul>\n");
    markdown = markdown.replace(/^\*\s(.*)$/gm, "<ul><li>$1</li></ul>\n");
    markdown = markdown.replace(/^\d\.\s(.*)$/gm, "<ul><li>$1</li></ul>\n");
    if (/^\*\s/.test(markdown) || /^\d\.\s/.test(markdown)) {
      markdown = "<ul>\n" + markdown + "</ul>\n";
    }
  
    // Convert links
    markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/g, '<a target="_blank" rel="noopener noreferrer" href="$2">$1</a>');
  
    if (withParagraphs) {
      // Convert paragraphs
      var paragraphs = markdown.split(/\n\s*\n/);
      for (var i = 0; i < paragraphs.length; i++) {
        // Check whether the paragraph is already wrapped in a <p> tag
        if (!/^<p>/.test(paragraphs[i])) {
          paragraphs[i] = "<p>" + paragraphs[i] + "</p>";
        }
      }
      markdown = paragraphs.join("\n");
    }
  
    return markdown;
  }
  
  async function getReminders({ env }) {
    const response = await fetch(`${env.S3_PUBLIC_URL}${env.S3_PATH}`);
    const data = await response.json();
    return data;
  }
  
  export async function onRequest(context) {
    const reminders = await getReminders(context);
  
    let title = "List from Apple Reminders";
    let introText = "";
  
    try {
      introText = md(
        sanitiseHtml(
          reminders.filter((x) => x.title.toLowerCase() === "par.intro")[0]
            .description
        ),
        true
      );
    } catch (e) {}
    try {
      title = sanitiseHtml(
          reminders.filter((x) => x.title.toLowerCase() === "par.title")[0]
            .description
        );
    } catch (e) {}
    const html = `<!DOCTYPE html>
    <html lang="nl">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body,
          html {
              width: 100%;
              height: 100%;
              padding: 0;
              margin: 0;
              font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
              color: rgb(55, 53, 47);
              background: white;
          }
          body {
            display: flex;
            justify-content: center;
          }
          .container {
            flex-shrink: 0;
            flex-grow: 1;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
            font-size: 16px;
            line-height: 1.5;
            width: 100%;
            z-index: 4;
            margin-top: 24px;
            max-width: min(721px, 90%);
          }
          h1 {
            max-width: 100%;
            width: 100%;
            white-space: pre-wrap;
            word-break: break-word;
            padding: 3px 2px;
            font-weight: 700;
            line-height: 1.2;
            margin: 0;
            margin-bottom: 12px;
            font-size: 40px;
          }
          .alert {
            background: #ffffcf;
            color: #bfbf00;
            padding: 5px 10px;
            font-weight: bold;
            margin-bottom: 12px;
            border-radius: 5px;
          }
          p {
            margin-top: 4px;
            margin-bottom: 2px;
          }
          a {
            color: inherit;
            text-decoration: none;
            position: relative;
            display: inline-block;
          }
          a::before {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 0;
            width: 100%;
            height: 2px;
            z-index: -1;
            background: #a3e2ff;
            transition: all 0.3s ease-in-out;
          }
          a:hover::before {
            bottom: 0;
            border-radius: 5px;
            height: 100%;
          }
          .wishlist {
            padding: 0;
            width: 100%;
          }
          .wishlist-item {
            list-style-type: none;
            padding: 10px 20px;
            background: rgba(55, 53, 47, 0.06);
            border-radius: 10px;
            margin-bottom: 12px;
            display: flex;
            flex-direction: column;
          }
          .wishlist-item .name {
            font-size: 18px;
            font-weight: bold;
          }
          .wishlist-item .description {
            margin-top: 12px;
            word-break: break-word;
          }
          @media (prefers-color-scheme: dark) {
            html, body {
                background: rgb(25, 25, 25);
                color: rgba(255, 255, 255, 0.81);
            }
            .wishlist-item {
                background: #ffffff08;
            }
            .alert {
                background: #ffffe015;
                color: #ffff6c;
            }
            a::before {
              background: #3F51B5;
            }
          }
        </style>
        <!-- Favicon -->
        <link rel="shortcut icon" href="//d107mjio2rjf74.cloudfront.net/web/static/img/favicon.ico"/><link rel="apple-touch-icon" sizes="60x60" href="//d107mjio2rjf74.cloudfront.net/web/static/img/apple-touch-icon-60x60.png"/><link rel="apple-touch-icon" sizes="76x76" href="//d107mjio2rjf74.cloudfront.net/web/static/img/apple-touch-icon-76x76.png"/><link rel="apple-touch-icon" sizes="120x120" href="//d107mjio2rjf74.cloudfront.net/web/static/img/apple-touch-icon-120x120.png"/><link rel="apple-touch-icon" sizes="152x152" href="//d107mjio2rjf74.cloudfront.net/web/static/img/apple-touch-icon-152x152.png"/><link rel="apple-touch-icon" sizes="180x180" href="//d107mjio2rjf74.cloudfront.net/web/static/img/apple-touch-icon-180x180.png"/><link rel="apple-touch-icon" href="//d107mjio2rjf74.cloudfront.net/web/static/img/apple-touch-icon.png"/>
        <meta name="description" content="${title}">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${title}">
        <meta name="twitter:image" content="https://publicapplereminders.com/publicapplereminders-socialshare.png">
        <meta name="twitter:card" content="summary_large_image">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${title}">
        <meta property="og:type" content="website">
        <meta property="og:image" content="https://publicapplereminders.com/publicapplereminders-socialshare.png">
        <meta property="og:url" content="https://publicapplereminders.com/">
    </head>
    <body>
      <main class="container">
          <h1>${title}</h1>
          ${introText}
          <ul class="wishlist">
          ${
            reminders.length
              ? reminders
                  .filter((x) => !["par.intro", "par.title"].includes(x.title.toLowerCase()) && !x.title.toLowerCase().startsWith('()'))
                  .map(
                    (item) =>
                      `<li class="wishlist-item">
                  <span class="name">${md(sanitiseHtml(item.title))}</span>
                  ${
                    item.description.length
                      ? `<span class="description">${md(
                          sanitiseHtml(item.description)
                        )}</span>`
                      : ""
                  }
                </li>`
                  )
                  .join("")
              : `<li class="wishlist-item">
            <span class="name">The Apple Reminders list was not found, or is empty.</span>
            <span class="description">Maybe something went wrong. Or the list is really just empty.</span>`
          }
          </ul>
      </main>
    </body>
  </html>`;
  
    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }