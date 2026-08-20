-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IndustryTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Business" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffService" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Queue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QueueEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PortfolioImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomerPoints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reward" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Referral" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Webhook" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Complaint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CancellationPolicy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NoShow" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "user_own" ON "User";
DROP POLICY IF EXISTS "business_owner" ON "Business";
DROP POLICY IF EXISTS "staff_business" ON "Staff";
DROP POLICY IF EXISTS "service_business" ON "Service";
DROP POLICY IF EXISTS "staffservice_business" ON "StaffService";
DROP POLICY IF EXISTS "queue_owner" ON "Queue";
DROP POLICY IF EXISTS "queueentry_business" ON "QueueEntry";
DROP POLICY IF EXISTS "queueentry_customer" ON "QueueEntry";
DROP POLICY IF EXISTS "booking_owner" ON "Booking";
DROP POLICY IF EXISTS "booking_customer" ON "Booking";
DROP POLICY IF EXISTS "portfolio_staff" ON "PortfolioImage";
DROP POLICY IF EXISTS "portfolio_business" ON "PortfolioImage";
DROP POLICY IF EXISTS "review_customer" ON "Review";
DROP POLICY IF EXISTS "review_business" ON "Review";
DROP POLICY IF EXISTS "customerpoints_customer" ON "CustomerPoints";
DROP POLICY IF EXISTS "reward_customer" ON "Reward";
DROP POLICY IF EXISTS "referral_customer" ON "Referral";
DROP POLICY IF EXISTS "notification_user" ON "Notification";
DROP POLICY IF EXISTS "apikey_business" ON "ApiKey";
DROP POLICY IF EXISTS "webhook_business" ON "Webhook";
DROP POLICY IF EXISTS "complaint_customer" ON "Complaint";
DROP POLICY IF EXISTS "complaint_business" ON "Complaint";
DROP POLICY IF EXISTS "announcement_business" ON "Announcement";
DROP POLICY IF EXISTS "cancellationpolicy_business" ON "CancellationPolicy";
DROP POLICY IF EXISTS "noshow_business" ON "NoShow";
DROP POLICY IF EXISTS "industrytemplate_public" ON "IndustryTemplate";

-- Users: can only read/update their own data
CREATE POLICY "user_own" ON "User" FOR ALL TO authenticated USING (auth.uid()::text = id);

-- Business: owner can read/update their business
CREATE POLICY "business_owner" ON "Business" FOR ALL TO authenticated USING ("ownerId" = auth.uid()::text);

-- Staff: business owner can manage
CREATE POLICY "staff_business" ON "Staff" FOR ALL TO authenticated USING (
    "businessId" IN (SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text)
);

-- Service: business owner can manage
CREATE POLICY "service_business" ON "Service" FOR ALL TO authenticated USING (
    "businessId" IN (SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text)
);

-- StaffService: business owner can manage
CREATE POLICY "staffservice_business" ON "StaffService" FOR ALL TO authenticated USING (
    "staffId" IN (SELECT id FROM "Staff" WHERE "businessId" IN (
        SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text
    ))
);

-- Queue: business owner can manage their queue
CREATE POLICY "queue_owner" ON "Queue" FOR ALL TO authenticated USING (
    "businessId" IN (SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text)
);

-- QueueEntry: business owner can manage, customer can see their own
CREATE POLICY "queueentry_business" ON "QueueEntry" FOR ALL TO authenticated USING (
    "queueId" IN (SELECT id FROM "Queue" WHERE "businessId" IN (
        SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text
    ))
);
CREATE POLICY "queueentry_customer" ON "QueueEntry" FOR SELECT TO authenticated USING ("customerId" = auth.uid()::text);

-- Booking: owner can see all, customer sees their own
CREATE POLICY "booking_owner" ON "Booking" FOR ALL TO authenticated USING (
    "businessId" IN (SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text)
);
CREATE POLICY "booking_customer" ON "Booking" FOR SELECT TO authenticated USING ("customerId" = auth.uid()::text);

-- PortfolioImage: staff can manage their own, business owner can manage all
CREATE POLICY "portfolio_staff" ON "PortfolioImage" FOR ALL TO authenticated USING ("staffId" IN (
    SELECT id FROM "Staff" WHERE "userId" = auth.uid()::text
));
CREATE POLICY "portfolio_business" ON "PortfolioImage" FOR ALL TO authenticated USING (
    "staffId" IN (SELECT id FROM "Staff" WHERE "businessId" IN (
        SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text
    ))
);

-- Review: customer can create their own, business owner can read
CREATE POLICY "review_customer" ON "Review" FOR ALL TO authenticated USING ("customerId" = auth.uid()::text);
CREATE POLICY "review_business" ON "Review" FOR SELECT TO authenticated USING (
    "businessId" IN (SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text)
);

-- CustomerPoints: customer can see their own
CREATE POLICY "customerpoints_customer" ON "CustomerPoints" FOR SELECT TO authenticated USING ("customerId" = auth.uid()::text);

-- Reward: customer can see their own (via pointsId -> CustomerPoints -> customerId)
CREATE POLICY "reward_customer" ON "Reward" FOR SELECT TO authenticated USING (
    "pointsId" IN (SELECT id FROM "CustomerPoints" WHERE "customerId" = auth.uid()::text)
);

-- Referral: customer can see their own
CREATE POLICY "referral_customer" ON "Referral" FOR SELECT TO authenticated USING ("referrerId" = auth.uid()::text OR "referredId" = auth.uid()::text);

-- Notification: user can read/update their own
CREATE POLICY "notification_user" ON "Notification" FOR ALL TO authenticated USING ("userId" = auth.uid()::text);

-- ApiKey: business owner can manage
CREATE POLICY "apikey_business" ON "ApiKey" FOR ALL TO authenticated USING (
    "businessId" IN (SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text)
);

-- Webhook: business owner can manage
CREATE POLICY "webhook_business" ON "Webhook" FOR ALL TO authenticated USING (
    "businessId" IN (SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text)
);

-- Complaint: customer can create, business owner can manage
CREATE POLICY "complaint_customer" ON "Complaint" FOR ALL TO authenticated USING ("customerId" = auth.uid()::text);
CREATE POLICY "complaint_business" ON "Complaint" FOR ALL TO authenticated USING (
    "businessId" IN (SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text)
);

-- Announcement: business owner can manage
CREATE POLICY "announcement_business" ON "Announcement" FOR ALL TO authenticated USING (
    "businessId" IN (SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text)
);

-- CancellationPolicy: business owner can manage
CREATE POLICY "cancellationpolicy_business" ON "CancellationPolicy" FOR ALL TO authenticated USING (
    "businessId" IN (SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text)
);

-- NoShow: business owner can manage
CREATE POLICY "noshow_business" ON "NoShow" FOR ALL TO authenticated USING (
    "businessId" IN (SELECT id FROM "Business" WHERE "ownerId" = auth.uid()::text)
);

-- IndustryTemplate: public read
CREATE POLICY "industrytemplate_public" ON "IndustryTemplate" FOR SELECT TO authenticated USING (true);