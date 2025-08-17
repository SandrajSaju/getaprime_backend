Video Demonstration Link: https://www.loom.com/share/931eb0a82a74405cbfd11ebbfea9235c

1. Clone the Repository

```bash
git clone https://github.com/SandrajSaju/getaprime_backend
cd getaprime_backend
```

2. Install Dependencies
```bash
 npm install
```
 
3. Configure Environment Variables

Create a .env file in the root of the project with the following content:

```bash
PORT=4000
JWT_ACCESS_SECRET=jwtaccesspassword
JWT_REFRESH_SECRET=jwtrefreshpassword

Note: Please find the db related variables in the last mail
```
Change values if needed (especially DB_USER, DB_PASSWORD, and DB_NAME) according to your PostgreSQL setup.

4. Set Up Database

Open PostgreSQL (via pgAdmin or CLI).

Create a new database:
```bash
CREATE DATABASE getaprime_db;
Note: It wont be needed if you use my cloud DB (find mail)
```

(Optional) If your PostgreSQL username or password is different from default (postgres / root), update them in the .env file.

Tables will be auto-created by TypeORM when you run the server (synchronize: true is enabled).

5. Run the Server
```bash
npm start
```

6. If you need to insert data, run these sql queries in pgAdmin query tool, so you will get exactly same data as in the video demo.
   
```bash
Note: It wont be needed if you use my cloud DB (find mail)

INSERT INTO features (name, description, category, created_at) VALUES
('Dashboard', 'Overview of all activities', 'Core', NOW()),
('Profile Management', 'Edit and manage your profile', 'Core', NOW()),
('Notifications', 'Receive updates and alerts', 'Core', NOW()),
('Task Management', 'Create and track tasks', 'Core', NOW()),
('Calendar', 'View events and schedules', 'Core', NOW()),
('Reports', 'Generate analytical reports', 'Analytics', NOW()),
('Export Data', 'Export your data to CSV or PDF', 'Analytics', NOW()),
('Import Data', 'Import data from external sources', 'Analytics', NOW()),
('User Roles', 'Manage user roles and permissions', 'Administration', NOW()),
('Activity Log', 'Track user activities', 'Administration', NOW()),
('Settings', 'Application settings', 'Core', NOW()),
('Email Integration', 'Connect and send emails', 'Communication', NOW()),
('SMS Notifications', 'Send SMS alerts', 'Communication', NOW()),
('File Upload', 'Upload and manage files', 'Core', NOW()),
('Advanced Search', 'Filter and search data', 'Analytics', NOW()),
('Data Backup', 'Automatic backup system', 'Administration', NOW()),
('API Access', 'Access API endpoints', 'Integration', NOW()),
('Webhook Integration', 'Setup webhooks for events', 'Integration', NOW()),
('Multi-Language Support', 'Switch languages', 'Core', NOW()),
('Dark Mode', 'Toggle dark/light themes', 'UI', NOW()),
('Live Chat', 'Real-time messaging', 'Communication', NOW()),
('Notifications Center', 'Manage all notifications', 'Core', NOW()),
('Billing Dashboard', 'View billing info', 'Billing', NOW()),
('Invoices', 'Generate and view invoices', 'Billing', NOW()),
('Subscription Management', 'Upgrade or downgrade plan', 'Billing', NOW()),
('Audit Trails', 'Track system changes', 'Administration', NOW()),
('Team Management', 'Manage multiple team members', 'Core', NOW()),
('Custom Reports', 'Build custom reports', 'Analytics', NOW()),
('Priority Support', 'Access to premium support', 'Support', NOW()),
('Data Encryption', 'Secure your data', 'Security', NOW()),
('Two-Factor Authentication', 'Extra security layer', 'Security', NOW()),
('Feature Toggles', 'Enable/disable features dynamically', 'Core', NOW()),
('Mobile Access', 'Use system on mobile devices', 'UI', NOW());

INSERT INTO tiers (name, description, price, created_at) VALUES
('Free', 'Access to 5 core features', 0.00, NOW()),
('Standard', 'Access to 18 features including all Free features', 9.99, NOW()),
('Premium', 'Access to all features including Standard features', 19.99, NOW());

INSERT INTO tier_features (tier_id, feature_id) VALUES
(1,1),
(1,2),
(1,3),
(1,4),
(1,5),
(2,1),
(2,2),
(2,3),
(2,4),
(2,5),
(2,6),
(2,7),
(2,8),
(2,9),
(2,10),
(2,11),
(2,12),
(2,13),
(2,14),
(2,15),
(2,16),
(2,17),
(2,18),
(3,1),
(3,2),
(3,3),
(3,4),
(3,5),
(3,6),
(3,7),
(3,8),
(3,9),
(3,10),
(3,11),
(3,12),
(3,13),
(3,14),
(3,15),
(3,16),
(3,17),
(3,18),
(3,19),
(3,20),
(3,21),
(3,22),
(3,23),
(3,24),
(3,25),
(3,26),
(3,27),
(3,28),
(3,29),
(3,30),
(3,31),
(3,32),
(3,33);
```
