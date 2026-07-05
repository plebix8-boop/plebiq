````md
# Admin Dashboard Page Plan

## Context

This product is a polling/voting application.

Product rules:

- Only 5–10 polls will be active at a time.
- Polls will stay active for a long time.
- Poll result details will have a dedicated page.
- The dashboard should focus on high-level business, user, and engagement stats.
- The dashboard should not show detailed option/result previews for each poll.
- The dashboard should be engagement-first, not content-count-first.

---

# Goal

Build a clean, professional Admin Dashboard page that helps the admin quickly understand:

- How many users are joining
- How many users are voting
- Which active polls are performing well
- Which active polls need attention
- Which countries are most active
- Which login method is most used
- Whether app engagement is increasing or decreasing

---

# Dashboard Sections

## 1. Top Summary Cards

Show the most important high-level cards at the top.

### Required Cards

1. Total Users
2. New Users Today
3. Active Polls
4. Total Votes
5. Total Views
6. Vote Conversion Rate

### Card Details

#### Total Users

Shows the total number of registered users.

#### New Users Today

Shows users who signed up today.

#### Active Polls

Shows currently active/live polls.

Since the product only has 5–10 active polls, this card is important.

#### Total Votes

Shows total votes across all polls.

#### Total Views

Shows total poll views across all polls.

#### Vote Conversion Rate

Formula:

```text
total_votes / total_views * 100
````

Show this as a percentage.

Example:

```text
43.6%
```

---

## 2. Active Poll Performance Table

This should be the main dashboard section.

Since there are only 5–10 active polls, show all active polls in one table.

### Table Columns

1. Poll Title
2. Category
3. Status
4. Total Votes
5. Total Views
6. Conversion Rate
7. Last Vote Time
8. Health Status
9. Action

### Notes

* Do not show option-level result previews here.
* The Action button should open the dedicated poll detail/result page.
* Use `View Details` as the action label.

---

## 3. Poll Health Status

Each active poll should have a health badge.

### Possible Health Badges

```text
High Engagement
Low Engagement
Needs Promotion
Low Conversion
Voting Slowed Down
Very Competitive
One-sided
```

### Suggested Rules

#### High Engagement

Poll has good views and good votes.

#### Needs Promotion

Poll has low views.

#### Low Conversion

Poll has high views but low votes.

#### Voting Slowed Down

Poll had voting activity before, but recent votes are low.

#### Very Competitive

Top options are close.

#### One-sided

One option is leading by a large margin.

### Important

Do not show the full option result breakdown on the dashboard. Only show the health status.

---

## 4. Votes Over Time Chart

Show a line chart for voting activity.

### Chart Title

```text
Votes Over Time
```

### Filters

Allow filtering by:

```text
Today
7 Days
30 Days
This Month
```

### Purpose

This chart should help the admin understand whether voting activity is increasing, decreasing, or stable.

---

## 5. User Growth Chart

Show a line chart for new user registrations.

### Chart Title

```text
User Growth
```

### Filters

Allow filtering by:

```text
7 Days
30 Days
This Month
This Year
```

### Data

Use the user `created_at` date.

---

## 6. Users by Country Chart

Show a bar chart.

### Chart Title

```text
Users by Country
```

### Data

Group users by country.

Example:

```text
Pakistan: 8,500
India: 5,200
USA: 3,100
UAE: 1,400
```

### Purpose

The admin should quickly see where users are coming from.

---

## 7. Votes by Country Chart

Show a bar chart or donut chart.

### Chart Title

```text
Votes by Country
```

### Data

Group votes by the voter user's country.

### Purpose

This is more important than users by country because it shows which countries are actually active.

---

## 8. Login Provider Chart

Show a donut chart.

### Chart Title

```text
Login Providers
```

### Values

```text
Google
Facebook
```

### Purpose

The admin should understand which login method users prefer.

---

## 9. Recent Activity

Show recent high-level activity.

### Activity Types

```text
New user joined
User voted
Poll created
Poll status changed
```

### Example

```text
Ahmed joined from Pakistan using Google
Sara voted on a poll
Admin activated a new poll
Poll status changed to closed
```

Keep this section simple.

---

# Final Dashboard Layout

## Row 1: Summary Cards

```text
[Total Users] [New Users Today] [Active Polls] [Total Votes] [Total Views] [Vote Conversion Rate]
```

## Row 2: Main Table

```text
Active Poll Performance Table
```

## Row 3: Charts

```text
Votes Over Time
User Growth
```

## Row 4: Audience Charts

```text
Users by Country
Votes by Country
Login Providers
```

## Row 5: Attention + Activity

```text
Polls Needing Attention
Recent Activity
```

---

# Do Not Include

Do not include this section on the dashboard:

```text
Active Poll Result Preview
```

Reason:

Poll result and option-level analytics already have a dedicated detail page.

The dashboard should only show high-level active poll performance and provide a button to open the dedicated detail page.

---

# Dashboard Priority

The dashboard should answer these questions in 5 seconds:

1. How many users do we have?
2. Are new users joining?
3. Are users voting?
4. Which active polls are performing well?
5. Which polls need attention?
6. Which countries are most active?
7. Which login provider is most used?
8. Is engagement going up or down?

---

# Recommended UI Style

Use a modern admin dashboard style.

## Cards

* Rounded corners
* Clear title
* Large value
* Small comparison text if available

Example:

```text
Total Votes
91,240
+12.5% from last week
```

## Charts

Use clean, readable charts.

Recommended chart types:

* Line chart for votes over time
* Line chart for user growth
* Bar chart for users by country
* Bar chart or donut chart for votes by country
* Donut chart for login provider

## Tables

Tables should be simple and scannable.

Use badges for:

```text
Live
Draft
Closed
High Engagement
Low Conversion
Needs Promotion
```

## Actions

For each active poll, provide:

```text
View Details
```

This should navigate to the dedicated poll detail/result page.

---

# Important Implementation Notes

* Do not overload the dashboard.
* Do not show poll option result breakdowns.
* Do not duplicate the dedicated poll detail page.
* Keep dashboard focused on admin decision-making.
* Since there are only 5–10 active polls, show all active polls in the performance table.
* Poll management details like drafts, closed polls, pinned polls, and featured polls should stay in the Poll Management page, not the main dashboard.

