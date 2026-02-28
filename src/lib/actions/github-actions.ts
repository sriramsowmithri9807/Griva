"use server";

export async function getGithubRepos(limit = 40) {
    try {
        const response = await fetch("https://tom-doerr.github.io/repo_posts/feed.xml", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/rss+xml, application/xml, text/xml",
            },
            next: {
                revalidate: 3600
            }
        });

        if (!response.ok) {
            console.error(`RSS Fetch Failed: ${response.status} ${response.statusText}`);
            return [];
        }

        const xml = await response.text();

        // Custom highly optimized regex parser to avoid parsing the 22MB XML DOM
        const items = [];
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;
        let count = 0;

        while ((match = entryRegex.exec(xml)) !== null && count < limit) {
            const entryXml = match[1];

            const titleMatch = entryXml.match(/<title>([\s\S]*?)<\/title>/);
            // Github repo link is stored in rel="related"
            const linkMatch = entryXml.match(/<link rel="related"[^>]*href="([^"]+)"/);
            // Fallback to normal link
            const altLinkMatch = entryXml.match(/<link href="([^"]+)"/);

            const contentMatch = entryXml.match(/<content[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/content>/);
            const dateMatch = entryXml.match(/<updated>([\s\S]*?)<\/updated>/);

            // Clean up content by stripping HTML tags
            let description = contentMatch ? contentMatch[1] : "";
            description = description.replace(/<\/?[^>]+(>|$)/g, "").trim().substring(0, 150);

            items.push({
                title: titleMatch ? titleMatch[1].trim() : "Untitled Repository",
                link: linkMatch ? linkMatch[1] : (altLinkMatch ? altLinkMatch[1] : "#"),
                contentSnippet: description,
                pubDate: dateMatch ? dateMatch[1].trim() : null,
            });
            count++;
        }

        return items;
    } catch (error) {
        console.error("Error fetching or parsing RSS feed:", error);
        return [];
    }
}
