package com.reactit.kyc.supp.web.rest;

import com.reactit.kyc.supp.service.RssFeedService;
import com.reactit.kyc.supp.service.dto.ArticleDTO;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/news")
public class RSSFeedResource {

    private final RssFeedService rssFeedService;

    public RSSFeedResource(RssFeedService rssFeedService) {
        this.rssFeedService = rssFeedService;
    }

    @GetMapping
    public List<ArticleDTO> getNews() {
        List<String> feeds = List.of(
            "https://thefintechtimes.com/feed/",
            "https://a-teaminsight.com/category/regtech-insight/feed/",
            "https://www.pymnts.com/feed/",
            "https://www.cnbc.com/id/10000664/device/rss/rss.html"
        );
        return rssFeedService.fetchArticles(feeds);
    }
}
