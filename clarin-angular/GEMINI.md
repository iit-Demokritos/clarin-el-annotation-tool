# Ellogon Annotation Tool (Clarin-Angular)

This project is the frontend for the Ellogon Annotation Platform, built with Angular. It provides a comprehensive web-based interface for annotating document collections, comparing annotations, and analyzing annotation data.

## 🛠 Technology Stack

- **Framework:** Angular 16
- **UI Libraries:**
  - [Angular Material](https://material.angular.io/)
  - [NG-MATERO](https://ng-matero.github.io/ng-matero/) (Admin Template/Layout)
  - Bootstrap 5
  - FontAwesome 6
- **State & Forms:**
  - [@ngx-formly/core](https://formly.dev/) (Dynamic Forms)
  - Reactive Forms
- **Visualization:**
  - Highcharts
  - JointJS
  - Wavesurfer.js
  - CodeMirror
- **Testing:** Karma & Jasmine
- **Linting:** ESLint & Stylelint
- **Documentation:** Compodoc

## 📂 Project Structure

- `src/app/components`: UI components organized by type.
  - `views/`: Main page components (Annotation, Collections, Inspection, etc.).
  - `dialogs/`: Modal dialogs.
  - `controls/`: Custom form controls and widgets.
  - `layouts/`: Application layouts.
- `src/app/services/`: Domain-specific logic (Annotation, Collection, Document, User, etc.).
- `src/app/models/`: TypeScript interfaces and classes for data structures.
- `src/app/ng-matero/`: Theme and layout components from the NG-MATERO framework.
- `src/assets/data/menu.json`: Configuration for the sidebar menu.

## 🚀 Key Workflows

### Development Environment

1.  **Start Backend:**
    ```bash
    npm run django
    ```
    (Note: This assumes the `backend-django` repository is cloned in a sibling directory).

2.  **Start Frontend with Proxy:**
    ```bash
    npm run local
    ```
    This uses `src/proxy-local.conf.json` to route API calls to the local Django backend.

### Quality Control

- **Linting:**
  ```bash
  npm run lint
  ```
- **Testing:**
  ```bash
  npm test
  ```
- **Documentation:**
  ```bash
  npm run compodoc:build
  ```

## 📜 Coding Mandates

- **Naming Conventions:** Follow standard Angular style guide (kebab-case for files, PascalCase for classes, camelCase for variables/methods).
- **Services:** Keep components lean. Business logic and API calls should reside in services.
- **Forms:** Prefer `@ngx-formly` for dynamic forms when applicable, otherwise use Reactive Forms.
- **Styling:** Use SCSS. Follow the theme patterns established in `src/app/ng-matero` and `src/styles`.
- **Internationalization:** Use `ngx-translate` for all user-facing strings. Extract keys using `npm run i18n:extract`.
- **UI Components:** Leverage Angular Material and NG-MATERO components for consistency.

## 🧩 Key Features

- **Collection Management:** Import, manage, and share document collections.
- **Annotation Editor:** Core interface for text and image annotation.
- **Inspection Tools:** Compare annotations from different users or documents.
- **Analytics:** Visualize annotation statistics and values.
- **Visualization Layout:** Dedicated layout for external visualization of annotations.
