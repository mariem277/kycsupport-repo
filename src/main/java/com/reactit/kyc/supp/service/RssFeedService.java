package com.reactit.kyc.supp.service;

import com.reactit.kyc.supp.service.dto.ArticleDTO;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

@Service
public class RssFeedService {

    public List<ArticleDTO> fetchArticles(List<String> feedUrls) {
        List<ArticleDTO> allArticles = new ArrayList<>();

        for (String feedUrl : feedUrls) {
            try (XmlReader reader = new XmlReader(new URL(feedUrl))) {
                SyndFeed feed = new SyndFeedInput().build(reader);
                for (SyndEntry entry : feed.getEntries()) {
                    allArticles.add(
                        new ArticleDTO(
                            entry.getTitle(),
                            entry.getLink(),
                            entry.getPublishedDate(),
                            cleanHtmlDescription(entry.getDescription() != null ? entry.getDescription().getValue() : "")
                        )
                    );
                }
            } catch (Exception e) {
                System.err.println("Error reading feed: " + feedUrl + " -> " + e.getMessage());
            }
        }

        return allArticles;
    }

    private String cleanHtmlDescription(String html) {
        Document doc = Jsoup.parse(html);

        Element firstParagraph = doc.selectFirst("p");
        return firstParagraph != null ? firstParagraph.outerHtml() : doc.body().text();
    }
}
