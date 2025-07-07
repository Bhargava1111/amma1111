# Admin Dashboard Implementation Plan

This document outlines the detailed plan for implementing comprehensive admin dashboard functionality and features, including User Management, enhanced Order Management, Reporting and Analytics, and a full Notification Management system.

## Current State Analysis

*   **AdminPage.tsx:** Serves as the foundation, currently including sections for product, category, and campaign management, along with a basic overview and a placeholder for notifications.
*   **AuthContext.tsx:** Handles user authentication and role management (`customer` or `admin`). Admin status is determined by email (`admin@example.com` or includes 'admin') or `ID` ('1'). It uses `window.ezsite.apis` for backend interactions. Includes `UserProfile` interface and `loadUserProfile` function, interacting with table `10411` for user profiles. No direct admin APIs for user management are exposed.
*   **OrderService.ts:** Provides functions for `createOrder`, `getUserOrders`, `getOrderById`, `updateOrderStatus`, `getAllOrders`, `trackOrder`, and `cancelOrder`. Interacts with `ORDERS_TABLE_ID` (10401) and `ORDER_ITEMS_TABLE_ID` (10402). `getAllOrders` is available for admin use.
*   **Notifications:** `NOTIFICATIONS_TABLE_ID` (10412) is used by `OrderService` and `AuthContext` for in-app notifications and emails. A dedicated management interface is needed.
*   **types/index.ts:** Defines core interfaces like `Product`, `Order`, `OrderItem`, `Address`, and `PaymentMethod`. Note: The `Order` interface here differs slightly from `OrderService.ts`. Consistency will be maintained by primarily using the `OrderService`'s `Order` interface for admin panel operations.

## Detailed Implementation Plan

### Goal 1: Implement User Management

*   **Objective:** Create a dedicated section in the admin dashboard to view, add, edit, and delete user accounts, and manage their roles.
*   **Steps:**
    1.  **Create `UserManagement.tsx` component:** This component will house the UI and logic for user management.
    2.  **Develop User Service (`UserService.ts`):** Create a new service to interact with `window.ezsite.apis` for user-related operations. This service will need functions for:
        *   `getAllUsers()`: Fetch all user profiles from table `10411`.
        *   `createUser(userData)`: Create a new user (potentially by calling `register` or a new admin-specific user creation API).
        *   `updateUser(userId, updateData)`: Update user profile information and potentially their role.
        *   `deleteUser(userId)`: Delete a user account.
    3.  **Integrate with `AdminPage.tsx`:** Add a new `TabsTrigger` and `TabsContent` for "Users" in `AdminPage.tsx` and render the `UserManagement` component.
    4.  **UI/UX:** Design a user-friendly interface with a table to display users, forms for adding/editing, and confirmation dialogs for deletion. Implement search, pagination, and filtering.

### Goal 2: Enhance Order Management

*   **Objective:** Provide a more detailed view of orders, allow status updates, and enable refund processing.
*   **Steps:**
    1.  **Create `OrderManagement.tsx` component:** This component will display a list of all orders.
    2.  **Utilize `OrderService.getAllOrders()`:** Fetch all orders using the existing `OrderService.getAllOrders()` function.
    3.  **Implement Order Details View:** When an order is selected, display its details, including order items (using `OrderService.getOrderById()`).
    4.  **Add Status Update Functionality:** Integrate `OrderService.updateOrderStatus()` to allow admins to change order statuses (pending, processing, shipped, delivered, cancelled).
    5.  **Refund Processing (Placeholder/Future):** Add a placeholder or a simple UI element for refund processing. Actual integration with a payment gateway is out of scope for this task.
    6.  **Integrate with `AdminPage.tsx`:** Ensure the existing "Orders" tab (or create one if not explicitly there) in `AdminPage.tsx` renders the `OrderManagement` component.

### Goal 3: Develop Reporting and Analytics

*   **Objective:** Create a section to display key business metrics and insights.
*   **Steps:**
    1.  **Create `ReportingAnalytics.tsx` component:** This component will house various charts and data visualizations.
    2.  **Define Data Sources:** Determine what data is available from `window.ezsite.apis` or can be derived from existing tables (e.g., total orders, total revenue, popular products, customer demographics).
    3.  **Implement Data Fetching:** Create functions to fetch and process data for reports (e.g., `getSalesData()`, `getProductPerformance()`). This might involve new `ezsite.apis.tablePage` calls with different filters and aggregations.
    4.  **Integrate Charting Library:** Utilize an existing charting library (e.g., `chart.tsx` from `src/components/ui/chart.tsx` if suitable, or integrate a new one if needed) to visualize data.
    5.  **Integrate with `AdminPage.tsx`:** Add a new `TabsTrigger` and `TabsContent` for "Reports" or "Analytics" in `AdminPage.tsx` and render the `ReportingAnalytics` component.

### Goal 4: Enhance Notification Management

*   **Objective:** Allow admins to send new notifications, view sent notifications, and manage notification templates.
*   **Steps:**
    1.  **Create `NotificationManagement.tsx` component:** This component will manage notifications.
    2.  **Implement Send Notification Feature:**
        *   Provide a form to compose new notifications (title, message, type, channel).
        *   Allow targeting specific users or all users.
        *   Utilize `window.ezsite.apis.tableCreate(NOTIFICATIONS_TABLE_ID, ...)` to send notifications.
    3.  **View Sent Notifications:** Fetch and display a list of all sent notifications from `NOTIFICATIONS_TABLE_ID`.
    4.  **Notification Templates (Future/Placeholder):** This can be a future enhancement. Focus on sending ad-hoc notifications for now.
    5.  **Integrate with `AdminPage.tsx`:** Enhance the existing "Notifications" tab in `AdminPage.tsx` to render the `NotificationManagement` component.

## High-Level Architecture Diagram

```mermaid
graph TD
    A[AdminPage.tsx] --> B{Tabs Navigation}
    B -- Overview --> C[Overview Section]
    B -- Products --> D[ProductManagement.tsx]
    B -- Categories --> E[CategoryManagement.tsx]
    B -- Campaigns --> F[CampaignManager.tsx]
    B -- Users --> G[UserManagement.tsx]
    B -- Orders --> H[OrderManagement.tsx]
    B -- Reports --> I[ReportingAnalytics.tsx]
    B -- Notifications --> J[NotificationManagement.tsx]

    G --> K[UserService.ts]
    H --> L[OrderService.ts]
    I --> M[ReportingService.ts]
    J --> N[NotificationService.ts]

    K -- ezsite.apis.tablePage/Create/Update/Delete --> O[Backend Tables: Users (10411)]
    L -- ezsite.apis.tablePage/Create/Update --> P[Backend Tables: Orders (10401), OrderItems (10402)]
    M -- ezsite.apis.tablePage/Custom Aggregations --> Q[Backend Tables: Orders, Products, Users]
    N -- ezsite.apis.tableCreate/Page --> R[Backend Tables: Notifications (10412)]
    N -- ezsite.apis.sendEmail --> S[Email Service]
```

## Dependencies and Considerations:

*   **`window.ezsite.apis`:** All interactions with the backend will go through this global object. I will assume it provides generic `tablePage`, `tableCreate`, `tableUpdate`, `tableDelete` functions for the specified table IDs.
*   **UI Components:** I will leverage existing UI components from `src/components/ui` (e.g., `Card`, `Table`, `Button`, `Input`, `Select`, `Dialog`, `Form`) to maintain consistency.
*   **Error Handling and Loading States:** Implement robust error handling and display loading indicators for all asynchronous operations.
*   **Data Fetching Strategy:** For components like `UserManagement` and `OrderManagement`, I will implement data fetching with pagination and filtering to handle large datasets efficiently.
*   **User Interface:** Focus on a clean, intuitive, and responsive design for the admin panel.