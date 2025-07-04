-- @pgsql Chat Query Editor (localhost)

CREATE INDEX IF NOT EXISTS idx_campaign_results_sent ON public.campaign_results (sent);
CREATE INDEX IF NOT EXISTS idx_campaign_results_opened ON public.campaign_results (opened);
CREATE INDEX IF NOT EXISTS idx_campaign_results_clicked ON public.campaign_results (clicked);
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON public.email_templates (name);
CREATE INDEX IF NOT EXISTS idx_targets_email ON public.targets (email);
