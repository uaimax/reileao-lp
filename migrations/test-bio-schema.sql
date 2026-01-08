-- Test script to verify bio schema works correctly
-- This can be run against a test database to verify the schema

-- Test inserting bio config
INSERT INTO bio_config (id, event_logo_url, show_event_date, show_trailer_button, bio_title, bio_subtitle)
VALUES (1, 'https://example.com/logo.png', true, true, 'Custom Title', 'Custom Subtitle')
ON CONFLICT (id) DO UPDATE SET
  event_logo_url = EXCLUDED.event_logo_url,
  show_event_date = EXCLUDED.show_event_date,
  show_trailer_button = EXCLUDED.show_trailer_button,
  bio_title = EXCLUDED.bio_title,
  bio_subtitle = EXCLUDED.bio_subtitle,
  updated_at = NOW();

-- Test inserting bio links
INSERT INTO bio_links (title, url, display_order, is_active, is_scheduled, schedule_start, schedule_end)
VALUES
('Test Link 1', 'https://example.com/1', 1, true, false, NULL, NULL),
('Test Link 2', 'https://example.com/2', 2, true, true, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour'),
('Test Link 3', 'https://example.com/3', 3, false, false, NULL, NULL);

-- Test analytics tracking
INSERT INTO bio_analytics (bio_link_id, user_agent, referrer, ip_address)
SELECT 
  bl.id,
  'Mozilla/5.0 Test Browser',
  'https://google.com',
  '127.0.0.1'::inet
FROM bio_links bl
WHERE bl.title = 'Test Link 1';

-- Test queries that the API will use

-- Get active bio links with analytics
SELECT 
  bl.*,
  COALESCE(analytics.click_count, 0) as click_count
FROM bio_links bl
LEFT JOIN (
  SELECT 
    bio_link_id,
    COUNT(*) as click_count
  FROM bio_analytics
  GROUP BY bio_link_id
) analytics ON bl.id = analytics.bio_link_id
WHERE bl.is_active = true
ORDER BY bl.display_order, bl.created_at;

-- Get scheduled links that should be visible now
SELECT *
FROM bio_links
WHERE is_active = true
AND (
  is_scheduled = false
  OR (
    is_scheduled = true
    AND schedule_start <= NOW()
    AND schedule_end >= NOW()
  )
)
ORDER BY display_order;

-- Get analytics summary
SELECT 
  bio_link_id,
  COUNT(*) as click_count,
  MAX(clicked_at) as last_click
FROM bio_analytics
GROUP BY bio_link_id
ORDER BY bio_link_id;

-- Clean up test data
DELETE FROM bio_analytics WHERE user_agent = 'Mozilla/5.0 Test Browser';
DELETE FROM bio_links WHERE url LIKE 'https://example.com/%';
DELETE FROM bio_config WHERE bio_title = 'Custom Title';