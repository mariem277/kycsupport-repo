package com.reactit.kyc.supp.service.dto;

import java.util.Date;

public class ArticleDTO {

    private Date publishedDate;
    private String description;
    private String title;
    private String link;

    public ArticleDTO(String title, String link, Date publishedDate, String description) {
        this.publishedDate = publishedDate;
        this.description = description;
        this.title = title;
        this.link = link;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Date getPublishedDate() {
        return publishedDate;
    }

    public void setPublishedDate(Date publishedDate) {
        this.publishedDate = publishedDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }
}
