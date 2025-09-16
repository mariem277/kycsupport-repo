package com.reactit.kyc.supp.service.dto;

public class MailStatsDTO {
    private int totalEmailsSent;

    public MailStatsDTO(int totalEmailsSent) {
        this.totalEmailsSent = totalEmailsSent;
    }

    public int getTotalEmailsSent() {
        return totalEmailsSent;
    }

    public void setTotalEmailsSent(int totalEmailsSent) {
        this.totalEmailsSent = totalEmailsSent;
    }
}
