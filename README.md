# Cyclos 4 user interface

<img src="cyclos.png" style="float:right" width="120" alt="Cyclos"/>

This project aims to create a modern, simple and intuitive user interface for
[Cyclos](https://www.cyclos.org/) version 4.11 and up (see the [required version](#cyclos-compatibility) below). The interface should be easy to customize and add functionality needed by specific projects.

A demo of the frontend can be seen at: https://demo-ui.cyclos.org/

## Technical details

- This application is built using [Angular](https://angular.io/) and [Bootstrap](https://getbootstrap.com), using the [ngx-bootstrap](https://valor-software.com/ngx-bootstrap/) integration library;
- It uses Cyclos' REST API for integration. The [ng-openapi-gen](https://github.com/cyclosproject/ng-openapi-gen) project is used to generate the client services and web service models. Starting with Cyclos 4.12, the API is described using OpenAPI 3 instead of Swagger 2;
- Translations are done separatedly from the Cyclos installation. This way they cannot be customized in Cyclos, but allows the user interface to grow independently from the deployed Cyclos version;
- Requests to the Cyclos server are performed directly from the browser. That means that either the web server serving this frontend should proxy the `api` path to the Cyclos backend or CORS should be enabled in Cyclos by setting `cyclos.cors.origin = <cyclos4-ui-domain>` in the `cyclos.properties` file;
- If you intent to customize or extend the functionality of this frontend, please, refer to the [project Wiki](https://github.com/cyclosproject/cyclos4-ui/wiki). There you will find some useful documentation.

## Implemented functionality

This frontend implements end-user functionality, as well as basic user administration / brokering and operator functionality. System administration functionality will always be performed in Cyclos' default web interface.

As of version 2.0, this frontend implements the following functionality:

- User access: login, logout, forgot password, login with expired password, login with pending agreements (no support for secondary access password / login confirmation);
- Integration with a login form in an external system: receives a pre-created session token and is able to use external URLs for login page and after logout redirect;
- Login / register with identity providers;
- Account history, transfer details by own user, admin and broker;
- Perform payment both to user and system, supports direct, scheduled and recurring payments, by own user, admin and broker;
- Receive payment (POS);
- Search scheduled payments, by own user, admin and broker;
- Search payments awaiting my authorization and payment authorizations;
- Search users (called business directory, as most systems only allow searching businesses);
- View user profile, with actions;
- Contact list;
- Manage passwords (change, generate new, unblock, disable / enable and set the security answer) by own user, admin and broker;
- Edit user / operator profile (images, basic / custom fields, phones, addresses and additional contact information) by own user, admin and broker;
- User registration - public, by admin and by broker;
- Search / manage advertisements;
- Webshop, ad questions, shopping cart, webshop settings, delivery methods;
- Access notifications, settings and receive push notifications;
- Voucher buying, redeeming, search;
- Run custom operations (self, advertisements and transfers);
- Settings (currently only for choosing the theme);
- Access the broker's list of registered users by own broker and admin;
- Search and register operators by own user, admin and broker;
- Operators groups (list, create, edit and remove) by own user, admin and broker;
- Change user / operator group by admin and broker;
- Change user / operator status by admin and broker;
- Overview of transfers, either by admin and broker;
- User alerts;
- Manage user brokers (add / remove / set main / list brokers);
- Connected users search / disconnect;
- Manage tokens (user / operator) (list / block / unblock / assign / activate);
- View shared / individual / process dynamic documents;
- Receive QR payment;
- User records.

More functionality will be added in future versions.

## Requirements

- [Cyclos](https://www.cyclos.org/) server. See the [required version](#cyclos-compatibility) below;
- [NodeJS](https://nodejs.org/) version 12+;
- [NPM](https://www.npmjs.com/) version 6.9+.

## Cyclos compatibility

The required Cyclos version depends on the frontend version:

- Frontend 2.0 requires Cyclos 4.13 or up;
- Frontend 1.1 / 1.2 requires Cyclos 4.12.1 or up;
- Frontend 1.0 requires Cyclos 4.11.2 or up

## Getting and preparing the code

Download the source code for the release you want at https://github.com/cyclosproject/cyclos4-ui/releases. Then extract the downloaded file to some directory. Finally, in a shell, run the following to install all NPM dependencies (might take a while):

```bash
cd path-to-cyclos4-ui
npm install
```

Alternatively, you can use the latest development version (master branch) by cloning the git repository:

```bash
git clone https://github.com/cyclosproject/cyclos4-ui.git
cd cyclos4-ui
npm install
```

In either case, the project will not compile yet because it depends on classes which are generated by [ng-openapi-gen](https://github.com/cyclosproject/ng-openapi-gen) and
[ng-translation-gen](https://github.com/cyclosproject/ng-translation-gen). When you first start the development server, or build the package, they will be generated. Alternatively, to generate all missing assets immediately, run:

```bash
npm run generate
```

## Basic setup

On the `src/app/setup.ts` you will find the file that needs to be configured for your project.
The most important settings are the following:

```typescript
export function setup() {
  Configuration.apiRoot = "api";
  Configuration.appTitle = "Cyclos";
  Configuration.appTitleSmall = "Cyclos frontend";
  Configuration.appTitleMenu = "Cyclos menu";
}
```

The `Configuration.apiRoot` seting points to the Cyclos backend. The default `api` value is used when the server where the frontend is deployed is proxying the requests to the Cyclos backend. An alternative is to set the full URL of a running Cyclos. In this case, make sure that CORS is allowed in `cyclos.properties` in the server. See [Access to the API backend](#access-to-the-api-backend) for more details.

There are plenty of configurations that can be set. Most of them are covered through the various sections of this document. Customizing these settings require a bit of programming in TypeScript. So, using an editor with strong support for the TypeScript language (such as [Visual Studio Code](https://code.visualstudio.com/)) is recommended, specially when requiring a more advanced setup.

## Debugging

Before running the development server, edit the `proxy.json` file. The `/api` entry should point to your Cyclos backend server. It is not required to setup CORS in this case, as the development server will proxy requests.

To start the development server, with hot reload, which should be accessible at http://localhost:4200/, run the following command:

```bash
npm start
```

## Building

Once you have the configuration set, you can build the user interface by typing:

```bash
npm run build
```

After the build process (which can take a few minutes) you will have the `dist/ui` directory (for version 3.0 or up), or `dist` (for previous versions) containing the resources that should be deployed to your web server (Apache, Nginx, etc). The same process applies when updating to a new version of the frontend: just update your local copy, for example, with a `git pull` command, build again and re-deploy. Make sure that the folder is completely replaced, so no stale files are left.

Angular assumes the application is deployed in the root path of your domain. For example, this is the case for `https://account.example.org`. If this is not the case, such as `https://www.example.org/path` you need to pass in the path name to Angular at compilation time, like:

```bash
# Replace /path/ with your base path. Don't forget both leading and trailing slashes.
npm run build -- --base-href /path/
```

## Deploying to a server

**Attention**: It is always advised to only use [tagged releases](https://github.com/cyclosproject/cyclos4-ui/releases) in production.
Don't deploy code directly from the master branch to production, unless you know you're doing. Code living on branches such as `1.0.x`, `1.1.x`, etc, tend to be more stable than master, but it is still advised to use only actual releases.

---

Angular, by default, uses `HTML5`'s [history.pushState](<https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method>) method, which produces URLs with paths which are undistinguishable from regular nested paths, but without producing a new request. Besides producing natural URLs, this method allows future expansions, such as using [server-side rendering](https://angular.io/guide/universal).

In order to correctly support the application, the server must also respond to deep links, even if they don't physically exist on the server. For example, if the frontend is deployed on `https://account.example.org`, and the user clicks on the pay user menu, he will see the URL `https://account.example.org/banking/payment`. However, there is no `banking/payment` directory in the generated folder (`dist`). Without specific configuration, clicking directly on that link, or refreshing the browser page while in this URL would present a `404` error page.

To solve this problem the server must include the `index.html` content on any request to files that don't physically exist on the server. For Apache, make sure the `mod_rewrite` is enabled, and the following configuration is applied:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

However, if the application is deployed in a sub path, then both `RewriteBase` and `RewriteRule` must be changed, like this (assuming `/path`):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /path/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /path/index.html [L]
</IfModule>
```

If you deploy on another HTTP server, please consult its documentation on how to achieve a similar result.

## Access to the API backend

There are 2 alternatives for the frontend application to access the Cyclos backend:

- Using CORS: The browser perform requests directly to the backend;
- Proxying the `api` directory: The HTTP server has a directory named `api` (must be this name!) proxying requests to the backend.

The CORS approach is faster / easier to deploy. In order for it to work, on the Cyclos backend's `cyclos.properties` file, set the `cyclos.cors.origin` to either `*` (any URL, not recommended for production) or to specific URLs (comma-separated list of allowed URLs). However, this approach has a drawback that before each actual request, the browser needs to send a preflight request, to ensure the actual request is allowed, because the Cyclos backend and the frontend run on different domains.

The second approach exposes a directory called `api` in the frontend application. For the browser, that directory is in the same domain as the frontend application itself. On the backend, the HTTP server (for example, Apache) will proxy all requests to `/api` to the Cyclos backend, which probably runs on the same server / datacenter. When proxying, Apache (or other web server) generally add request headers with information about the original request. The de-facto standard header name is `X-Forwarded-For`.

Make sure that in `cyclos.properties` the following is set: `cyclos.header.remoteAddress = X-Forwarded-For`. This is critical, because if multiple logins attempt fails, the remote address is blocked, and this will prevent blocking the backend server's IP address. Also this makes Cyclos log correctly the IP addresses. However, it is also advised to protect against malicious attempts to forge a `X-Forwarded-For` header. As the Cyclos server itself is (probably) already proxied by an Apache (to handle SSL, etc), add in that apache the following rule, to only accept the `X-Forwarded-For` header from the host serving the frontend application:

```apache
RewriteEngine On
# Use the list of accepted IP addresses
RewriteCond %{HTTP:X-Forwarded-For} !(1.1.1.1|2.2.2.2)
RewriteRule .* - [F]
```

To setup the proxy in Apache, make sure the `mod_proxy` and `mod_proxy_http` modules are enabled. Then apply the following configuration, replacing `http://localhost:8888/api` with the correct backend URL (don't forget to include the `/api` at the end):

```apache
<IfModule mod_proxy.c>
  ProxyPass "/api" "http://localhost:8080/cyclos/api" keepalive=On connectiontimeout=10 timeout=60
  ProxyPassReverse "/api" "http://localhost:8080/cyclos/api"
  ProxyPassReverseCookiePath "/cyclos/" "/"
</IfModule>
```

Alternatively, if the frontend is deployed in a sub path, the path must be specified:

```apache
<IfModule mod_proxy.c>
  ProxyPass "/path/api" "http://localhost:8080/cyclos/api" keepalive=On connectiontimeout=10 timeout=60
  ProxyPassReverse "/path/api" "http://localhost:8080/cyclos/api"
  ProxyPassReverseCookiePath "/cyclos/" "/ui/"
</IfModule>
```

Note that it is important to set `keepalive=On` for [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) to work. It is also recommented to have a timeout larger than 40 seconds, which is the time Cyclos keeps open event stream connections. Also note the `ProxyPassReverseCookiePath` directive. If you happen to have problems logging in while using a proxy is because the cookie path, sent by the backend Tomcat does not match the frontend path visible to users.

For other HTTP servers, please, consult their documentation on how to achieve the same result.

## Improving performance on the HTTP server

Angular generates some large, yet minified, JavaScript and CSS files. Two techniques can make loading the page much faster:

- Compression: Compresses the files when sending them to the client;
- Cache: Clients don't need to fetch again unchanged files.

These should be enabled on the web server. On Apache, the following configuration can be applied:

```apache
  <IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
  </IfModule>
  <IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/* "access plus 1 days"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType text/javascript "access plus 1 year"
    ExpiresByType text/json "access plus 1 year"
  </IfModule>
```

It is safe to set a very large expiration date for CSS / JavaScript / JSON (translation) files because we explicitly enable the hashing on generated file names, making the file name change whenever the content changes.

## Generating links on the Cyclos backend that point to the frontend

Cyclos generates some links which are sent by e-mail to users. Examples include the e-mail to validate a registration, or some notification. It is desired that when the user clicks on such links, he is forwarded to the deployed frontend application, not to the Cyclos default web interface.

To achieve this, Cyclos allows using a script to generate links. As a global administrator (which may be switched to the network), in 'System > Tools > Script', create a script of type 'Link generation', with the following content:

```groovy
import org.cyclos.impl.utils.LinkType
import org.cyclos.entities.system.ExternalRedirectExecution
import org.cyclos.utils.StringHelper

if (user != null && user.admin && user.group.adminType != null) {
    // Don't generate custom links for system administrators
    return null
}

String root = scriptParameters.rootUrl
switch (type) {
    case LinkType.REGISTRATION_VALIDATION:
        return "${root}/users/validate-registration/${validationKey}"
    case LinkType.EMAIL_CHANGE:
        return "${root}/users/validate-email-change/${validationKey}"
    case LinkType.FORGOT_PASSWORD:
        return "${root}/forgot-password/${validationKey}"
    case LinkType.LOGIN:
        return "${root}/login"
    case LinkType.EXTERNAL_REDIRECT:
        ExternalRedirectExecution e = binding.externalRedirectExecution
        return "${root}/operations/callback/${maskId(e.id)}/${e.verificationToken}"
    case LinkType.NOTIFICATION:
        def l = StringHelper.camelize(location.name())
        return "${root}/redirect/${l}" + entityId ? "?id=${maskId(entityId)}" : ""
}
```

<!-- Only change this when Cyclos 4.14 is released, with a note
```groovy
import org.cyclos.entities.system.CustomWizardExecution
import org.cyclos.entities.system.ExternalRedirectExecution
import org.cyclos.impl.utils.LinkType
import org.cyclos.utils.StringHelper

if (user != null && user.admin && user.group.adminType != null) {
    // Don't generate custom links for system administrators
    return null
}

String root = scriptParameters.rootUrl
switch (type) {
    case LinkType.REGISTRATION_VALIDATION:
        return "${root}/users/validate-registration/${validationKey}"
    case LinkType.EMAIL_CHANGE:
        return "${root}/users/validate-email-change/${validationKey}"
    case LinkType.FORGOT_PASSWORD:
        return "${root}/forgot-password/${validationKey}"
    case LinkType.LOGIN:
        return "${root}/login"
    case LinkType.EXTERNAL_REDIRECT:
        ExternalRedirectExecution e = binding.execution
        return "${root}/operations/callback/${maskId(e.id)}/${e.verificationToken}"
    case LinkType.WIZARD_EXTERNAL_REDIRECT:
        CustomWizardExecution we = binding.execution
        return "${root}/wizards/callback/${we.key}"
    case LinkType.NOTIFICATION:
        def l = StringHelper.camelize(location.name())
        return "${root}/redirect/${l}" + entityId ? "?id=${maskId(entityId)}" : ""
}
``` -->

Then, in 'System > System configuration > Configurations' select the configuration applied to users (or the default one) and mark the 'Link generation' field for customization. Then select the script you created and set the following as parameters, replacing the URL with your deployed URL:

```properties
rootUrl = https://account.example.com
```

## Customizing layout

There are several layout aspects that can be customized:

### Change the application logo

By default, the application logo is served from `src/images/logo.png`. You can either replace the image served from that URL or change the `Configuration.logoUrl` property in `src/app/setup.ts` to set the location from which the logo will be served. Here is an example:

```typescript
export function setup() {
  Configuration.logoUrl = "https://www.example.com/images/logo.png";
}
```

### Change the shortcut icon (favicon)

By default, the same application logo is used as shortcut icon. However, it is possible to change that to another URL, or even set multiple images for different sizes.

Here is an example for having a single shortcut icon:

```typescript
export function setup() {
  Configuration.shortcutIcons = [
    { url: "https://www.example.com/images/icon.png" },
  ];
}
```

And here is a more complete example, with multiple icons:

```typescript
export function setup() {
  Configuration.shortcutIcons = [
    { size: 32, url: "https://www.example.com/images/icon-32.png" },
    { size: 64, url: "https://www.example.com/images/icon-64.png" },
    { size: 192, url: "https://www.example.com/images/icon-192.png" },
    { size: 512, url: "https://www.example.com/images/icon-512.png" },
    {
      size: 120,
      rel: "apple-touch-icon",
      url: "https://www.example.com/images/icon-120.png",
    },
    {
      size: 152,
      rel: "apple-touch-icon",
      url: "https://www.example.com/images/icon-152.png",
    },
    {
      size: 180,
      rel: "apple-touch-icon",
      url: "https://www.example.com/images/icon-180.png",
    },
  ];
}
```

### Layout breakpoints

Cyclos uses [Bootstrap breakpoints](https://getbootstrap.com/docs/4.3/layout/overview/) with an additional one:

- `xxs` for extra small devices, such as KaiOS's feature phones;
- `xs` for portrait smart phones;
- `sm` for landscape smart phones;
- `md` for portrait tablets;
- `lg` for landscape tablets / smaller resolution desktops;
- `xl` for desktops.

Also, greater-than and lower-than variations are available: `gt-xxs` (`xs` or greater) up to `gt-lg`, as well as `lt-xg` up to `lt-xs`.

### Customize the logo, title and landing page per breakpoint

This frontend allows configuring, per [layout breakpoint](#layout-breakpoints):

- Whether the image will be displayed, and which image URL (different from the default);
- Which title to show: large, small, none or a customized one;
- Which is the landing page, that is, the initial page the users see when browsing to the application root - home page or login page;
- The initial result type on users and advertisements search.

The `xxs` breakpoint is an exception, and is fixed: the logo is never shown and the title actually shows the current page title. The other defaults are:

- For portrait mobiles (`xs`) the logo is hidden, and the small title is shown;
- For landscape mobiles (`sm`) the logo is hidden, and the large title is shown;
- For tablets and desktop (`gt-sm`) the logo is shown together with the large title.

Overridding these values can be done in `src/app/setup.ts` file. It is guaranteed that all possible breakpoints have already an object set in Configuration, so its direct properties can be set. Here is an example setting both an object and a direct property:

```typescript
export function setup() {
  // Always show a small logo and start with the login page for mobile
  Configuration.breakpoints["lt-md"] = {
    logoUrl: "https://www.example.com/images/logo-small.png",
    landingPage: "login",
  };
  // Also use a different logo for large desktops
  Configuration.breakpoints["xl"].logoUrl =
    "https://www.example.com/images/logo-large.png";
}
```

If your logo is already the full name of your project, you could also never show the application title, to avoid redundancy:

```typescript
export function setup() {
  // Always show the logo and no title
  Configuration.breakpoints["gt-xxs"] = {
    logoUrl: Configuration.logoUrl,
    title: "none",
  };
}
```

If this is the case, you may also want to remove the height limitation on the logo, which is limited to 32 pixels by default. If so, add on `src/styles/_custom.scss` (adjust to your liking):

```scss
top-bar .logo {
  max-height: 80% !important;
}
```

### Customizing the theme (style)

Users have the option to use a light or a dark theme. This can be changed in the settings menu.

The layout is built using [Bootstrap 4](https://getbootstrap.com/). Bootstrap allows customizing several variables in [SASS](https://sass-lang.com/). In addition to the built-in variables, several variables are defined in `src/_definitions.scss`. They should, however, be customized in the `src/styles/custom-definitions.scss` file. Just copy the variables to this file. The advantage of customizing in a separated file is that if new definitions appear in newer versions of the frontend, you don't have to merge them in the customized version.

The most important variables are the following:

- `$primary` / `$primary-dark`: The primary colors, from which other colors are derived: the top bar background color (`$top-bar-bg` / `$top-bar-bg-dark`), the theme color (`$theme-color-bg` / `$theme-color-dark`, used by the browser, for example, Chrome on android, to theme itself);
- `$accent` / `$accent-dark`: The accent color, which defines the color of most page elements, like headers, links and buttons;
- `$font-import-url`: The URL which will be used to import a font. By default is the Google Fonts URL for Roboto, Android's default font. It is widely used, but lacks support to some character sets. If you use Cyclos in a language that has glyphs not covered by Roboto, you can use, for example, [Noto Sans](https://fonts.google.com/specimen/Noto+Sans). Just take care that the default font weight for bolds used in the frontend is 500, which is not available in Noto Sans. If switching, also change the `$font-weight-bold` to `700`.
- `$font-family-sans-serif`: Actually sets the font. Must be consistent with the `$font-import-url` variable. The default font is Roboto.

You can also create custom styles for the application. To do so, just edit the `src/styles/_custom.scss` file. This is a SASS file, which is a superset of the standard CSS. Note that as styles defined in componenets generally have a greater priority, it might be needed to use the `!important` modifier for the custom definitions to be used.

### Main menu position

By default, on desktop resolutions, the menu is displayed in the top bar. An alternative is to have the menu displayed in a separated menu bar below the top. To configure this, set in the `src/app/setup.ts` file:

```typescript
export function setup() {
  // true means a separated menu bar, false means joining the menu on the top bar
  Configuration.menuBar = true;
}
```

### Customize advertisement categories

It is possible to customize the advertisements category icons and colors, which are shown when selecting the marketplace menu item. It is recommended that all the root advertisement categories in Cyclos have an internal name. The default settings in the frontend matches the categories created by default when creating a network in Cyclos via the wizard. Here is an example of the `src/app/setup.ts` file with the default settings:

```typescript
export function setup() {
  // The key is the ad category internal name, the value defines the icon and color
  Configuration.adCategories = {
    community: { icon: "people", color: "#2196f3" },
    food: { icon: "restaurant", color: "#f04d4e" },
    goods: { icon: "pages", color: "#ff9700" },
    housing: { icon: "location_city", color: "#029487" },
    jobs: { icon: "work", color: "#8062b3" },
    labor: { icon: "business", color: "#de3eaa" },
    leisure: { icon: "mood", color: "#687ebd" },
    services: { icon: "room_service", color: "#8ec63f" },
  };
}
```

### Customize custom operations and records

Similarly to advertisement categories, it is also possible to set a custom icon for custom operations and record types, by internal name. Here is an example of the `src/app/setup.ts`:

```typescript
export function setup() {
  // The key is the custom operation internal name, the value defines the icon
  Configuration.operations = {
    operation1: { icon: "format_paint" },
    operation2: { icon: "get_app" },
  };
  // It is also possible to assign directly
  Configuration.records.recordType1 = { icon: "account_balance_wallet" };
}
```

## Customizing content

The Cyclos frontend supports several kinds of content that can be customized:

- The home page, shown for guests;
- What is displayed in the dashboard, which is the initial page for logged users;
- Content pages, which are custom pages that show up in the menu;
- Banners, shown on desktop layout.

All these aspects are configured in the `src/app/setup.ts` file. By default, the file `content/home.html` is used to generate the home content for guests. Projects can either customize that file or set a different strategy to fetch the home content. More on this subject is presented ahead. Also, by default, there are no custom content pages or banners.

Every content implement the `Content` interface (defined in `src/app/content/content.ts`) which has a property called `content`. It can either be a string, with the static content (compiled into the code), or a `ContentGetter`, which is able to fetch content from an external source. There are the following built-in `ContentGetter` implementations:

- `ContentGetter.url(url)`: Performs an HTTP GET request and resolves the content body;
- `ContentGetter.image(url)`: Shows an external image;
- `ContentGetter.iframe(url)`: Includes a given page in an IFrame. To make the `iframe` adjust to the content of the contained page, uses the [iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) library, which works even across domains. The requirement is that the loaded page includes the following JavaScript: https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.6.3/iframeResizer.min.js;
- `ContentGetter.cyclosPage(url)`: Fetches the content of a Cyclos floating page, created in 'Content' > 'Content management' > 'Menu and pages'. From there, select a configuration (if multiple), create a new Floating page and, after saving it, copy the URL. That URL need to be passed as the parameter. This implementation uses Cyclos' `WEB-RPC` mechanism to fetch the content (as retrieving content pages is not in the Cyclos REST API so far), using the following URL: `<root>/web-rpc/menuEntry/menuItemDetails/<id>`. As such, either Cyclos must be setup to allow CORS requests from the frontend URL, or a proxy should be setup to the `/web-rpc/menuEntry/menuItemDetails/` path, similar to the proxy to `/api` (as described above), and using a relative URL. Example: `/menuItemDetails/*` is proxied to `<root>/web-rpc/menuEntry/menuItemDetails/*`. In such case, the URL parameter would be `menuItemDetails/<id>`.

When content has a `cacheKey`, it is cached locally in the browser, by default, for 1 hour. It is possible to change the `cacheSeconds` property to the desired number. If set to a negative number, the cache will never expire. The cache uses the browser local storage, so clearing the browser cache won't invalidade cached content. Instead, to locally remove cached content, browsers offer ways to remove website data.

The content object defining the home page is a `ContentWithLayout`, which also adds the following:

- `layout`: Can be either `full`, indicating that the content takes the entire available width and height, or `card`, in which case the content is shown inside a regular box, optionally with a title. When not set will be either `full` or `card` depending on whether there's a title or not;
- `title`: The title used when `layout` is `card`.

Here is an example to setup the home page for guests pointing to a content page in Cyclos, and thus, with the possibility to customize it directly from the Cyclos server:

```typescript
export function setup() {
  // This example uses the full URL, assuming the Cyclos server has CORS enabled
  Configuration.homePage = {
    content: ContentGetter.cyclosPage(
      "https://my-cyclos-instance/web-rpc/menuEntry/menuItemDetails/124356723644"
    ),
  };
}
```

So, fetching content for the home page is straightforward. Content pages and banners, on the other hand, require a bit more work, as described below.

### Content pages

Custom content pages can be very useful for projects that want to add a manual, some additional information pages, simple contact forms and so on. They are available both for guests and logged users, and in case of logged users, can be placed in a dedicated root menu item (internally called `content`) or in some other root menu (banking, marketplace or personal). **Important:** For logged users, if there is at least one visible content page with full layout, the root menu will be a dropdown, as the left menu will not be shown on full layout. However, if all pages for logged users use the `card` layout, then a side menu will be shown. For guests we never show a left menu, so the content menu is always a dropdown.

To enable content pages you must create an implementation of the `ContentPagesResolver` interface, defined in `src/app/content/content-pages-resolver.ts`. It has a single method called `contentPages`, receiving the Angular injector reference (used to obtain shared services) and must return either a `ContentPage[]` or an observable of it. Then, in the `app/setup.ts` file, instantiate that class, like this:

```typescript
import { ExampleContentPagesResolver } from "app/content/example-content-pages-resolver";

export function setup() {
  Configuration.contentPages = new ExampleContentPagesResolver();
}
```

Each content page, defined in `src/app/content/content-page.ts` extend `ContentWithLayout`, and add a few other important fields:

- `slug`: A part of the URL which is used to identify this content page. When not set, one is generated, but it is recommended to always set one;
- `label`: The label displayed on the menu. Can be shorter than the title. When not set, will be the same as the title;
- `icon`: A custom icon for this page on the menu;
- `loggedUsers`: Indicates whether this page is shown to logged users, yes by default;
- `guests`: Indicates whether this page is shown to guests, yes by default;
- `rootMenu`: Indicates that this page is shown in another root menu instead of the default (Information). Can be either `content` (default), `banking`, `marketplace` or `personal`.

Here are are some examples: [one that uses some static pages](https://github.com/cyclosproject/cyclos4-ui/blob/master/src/app/content/example-content-pages-resolver.ts) and [one that fetches pages from a Wordpress instance](https://github.com/cyclosproject/cyclos4-ui/blob/master/src/app/content/wordpress-content-pages-resolver.ts) (needs the full URL to the WordPress REST API as constructor argument).

### Banners

Banners are shown in cards (boxes) below the left menu in the large layout. No banners are ever shown in mobile or in the dashboard page. Each card has one or more banners. When there are multiple banners, they will rotate after a given number of seconds.

To use banners you must create an implementation of the `BannerCardsResolver` interface, defined in `src/app/content/banner-cards-resolver.ts`. It has a single method called `bannerCards`, receiving the Angular injector reference (used to obtain shared services) and must return either a `BannerCard[]` or an observable of it. Then, in the `app/setup.ts` file, create an instance of that class, like this:

```typescript
import { ExampleBannerCardsResolver } from "app/content/example-banner-cards-resolver";

export function setup() {
  Configuration.banners = new ExampleBannerCardsResolver();
}
```

The `BannerCard` interface, defined in `src/app/content/banner-card.ts`) has the following properties:

- `banners`: Which banners to show. Can be either an array of `Banner`s or an observable of it. This is the only required property. When there are multiple banners, they will rotate after a given number of seconds. More on the `Banner` interface below;
- `loggedUsers`: Indicates whether this card shows up for logged users, yes by default;
- `guests`: Indicates whether this card shows up for guests, no by default;
- `rootMenus`: Indicates on which root menus this card shows up. By default will be shown on all except home / dashboard. Note that there are distinct root menus for the advertisements / users directory for guests and marketplace for logged users, see the `src/app/shared/menu.ts` file for more details;
- `menus`: Indicates on which specific menus this card shows up. By default will be shown on all except home / dashboard;
- `ngClass` / `ngStyle`: Data passed to Angular's `ngClass` and `ngStyle` attributes on the card element. Useful, for example, to remove the border and padding around banners, set `ngClass` to `['border-0', 'p-0']`. Also, to make a banner card have a dark background and light text, set `ngClass` to `['background-dark', 'text-light']`.

The `Banner` interface (defined in `src/app/content/banner.ts`) extends `Content`, thus, retaining the `content` field which is either a string or a `ContentGetter` and local cache capabilities. It also adds the following properties:

- `timeout`: When there are multiple banners in the card, represents the number of seconds, 10 by default, before changing to the next banner;
- `link`: Can be set to an URL to which the user navigates when clicking the banner. Can both be an internal URL, starting with `/`, or external URL, starting with the scheme (https / http). By default, the banner has no link;
- `linkTarget`: When set, is the `target` attribute of the `<a>` tag used to create the banner link. If set to `_blank` will open the link in a new tab / window.

There is [an example BannerCardsResolver here](https://github.com/cyclosproject/cyclos4-ui/blob/master/src/app/content/example-banner-cards-resolver.ts).

### Customizing the dashboard

The dashboard is the home page for logged users. It contains several items that present useful information for users. Each item is an independent component that can be customized. Also, each item can be enabled only for some [layout breakpoints](#layout-breakpoints). When displayed on desktop, the dashboard has 3 columns: `left`, `right` and `full` (presented below). Each item defines on which column it is shown.

The following dashboard items are available:

- **Quick access**: Presents a list with links to common actions. Each link has an icon and a label. Allows specifying which links are shown and on which resolution breakpoints they are shown;
- **Account status**: Shows relevant data for an account, namely the current balance, a chart with the account balance over the last few months and a list with the last incoming transfers. Also has a button to view the account history;
- **Combined account status**: Shows the current balance and a chart with balance history for multiple accounts. The account name is a link to the full account history;
- **Latest advertisements**: Shows some of the latest advertisements;
- **Latest users**: Shows some of the users that have been activated last;
- **Content**: Shows a custom content.

The default dashboard is comprised of:

- Quick access on all breakpoints, but only showing account links for `lt-md`, as larger breakpoints will have a dedicated account status item;
- Account status if the user has a single visible account, only for breakpoint `gt-sm`;
- Combined account status if the user has multiple accounts, only for breakpoint `gt-sm`;
- Latest advertisements, only for breakpoint `gt-sm`;
- A content page, showing a sample events static page, on all breakpoints.

Generally projects need to customize a few aspects of the default dashboard, such as removing the latest ads or replacing it by latest users, and to show another content item. The easiest way to accomplish this is to extend the `DefaultDashboardResolver` class, which is defined in `src/environments/default-dashboard-resolver.ts` file. Then override the `dashboardItems` method to add only the desired items. If the only customization is to replace the content item for another page, just override the `contentPage` method to return the alternative page, don't override the `dashboardItems` method.

It is also possible to do a completely different dashboard, skipping the `DefaultDashboardResolver` class entirely. Finally, set your custom `DashboardResolver` instance like this:

```typescript
import { CustomDashboardResolver } from "app/custom-dashboard-resolver";

export function setup() {
  Configuration.dashboard = new CustomDashboardResolver();
}
```

### Content style that adapts to both light and dark themes

Users can choose whether they want a light or dark theme. When writing custom content, users will get a better experience if the content style automatically adapts to the preference.

The `body` tag has the `dark` class added for users that prefer the dark theme. Also, several class names are provided which adapt to light / dark variants. They are based on variables set on `src/_definitions.scss`, and are:

- `primary-color`: Sets the `color` property to the primary theme color.
- `primary-bg`: Sets the `background-color` property to the primary theme color, and the `color` property to a contrast color, allowing readable text.
- `accent-color`: Sets the `color` property to the accent theme color.
- `accent-bg`: Sets the `background-color` property to the accent theme color, and the `color` property to a contrast color, allowing readable text.
- `body-color`: Sets the `color` property to the body text color, which can be set to a different color on light / dark themes.
- `body-bg`: Sets the `background-color` property to the body background color, and the `color` property to the body text color, allowing readable text.
- `text-muted`: Sets the `color` property to the text-muted color, which can be set to a different color on light / dark themes.
- `border-color`: Sets the `border-color` property to the general border color, adapting to light / dark theme. However, no border style / width is defined. It is also possible to use the standard Bootstrap's `border`, `border-top`, `border-bottom`, `border-left` and `border-right` classes, as they are customized in dark themes to the correct color.

For pages that are included within iframes using `ContentGetter.iframe(url)`, a parameter is automatically added: `theme=light` or `theme=dark`, so the generated content can adapt. Here is an example WordPress theme for pages which are included in iframes, and which adapt to both light and dark themes (based on [this page](https://www.wonderplugin.com/wordpress-tutorials/how-to-create-a-wordpress-page-without-header-menu-sidebar-and-footer/)):

```php
<html <?php language_attributes(); ?> class="no-js">
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="<?php echo get_stylesheet_directory_uri(); ?>/style-cleanpage.css"
    rel="stylesheet" type="text/css">
  <?php wp_head(); ?>
</head>
<body class="<?php echo($_REQUEST['theme'] == 'dark' ? 'dark' : 'light'); ?>">
<?php
    while ( have_posts() ) : the_post();
        the_content();
    endwhile;
?>
<?php wp_footer(); ?>
</body>
</html>
```

Then, the corresponding style:

```css
@import url("https://fonts.googleapis.com/css?family=Roboto:400,500");

body {
  font-family: "Roboto";
  font-size: 0.875rem;
  color: #333333;
  background-color: white;
  overflow-x: hidden;
  overflow-y: auto;
}
body.dark {
  color: white;
  background-color: #252525;
}

* {
  margin: 0;
  padding: 0;
}

a:link,
a:visited {
  color: #1e88e5;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

h1,
h2,
h3,
b {
  font-weight: 500;
}
```

### Creating links to other pages

When linking to other pages from a custom page, special care is needed to not trigger a full page reload, as simply assigning a new URL would make the browser reload the entire application, hurting the user experience.

For that matter, the frontend registers a JavaScript function `navigate(url|anchor, event)`. It should be called on the anchor's `onclick` event, like the following example:

```html
You can login <a href="/login" onclick="navigate(this, event)">here</a>.
```

Note that using this method will have the same effect as clicking on the corresponding menu entry. So, the above example will only take the user to the login page if viewing it as guest. If viewing as logged user, the user will actually be taken to the dashboard. This method also takes care of highlighting the correct menu item.

## Translating

This application doesn't uses [Angular's built-in I18N](https://angular.io/guide/i18n) because it is very static, requiring a translated copy of the application to be built for each supported language. Instead, the Cyclos frontend uses [ng-translation-gen](https://github.com/cyclosproject/ng-translation-gen), so the translation keys are read from a JSON file, and generate TypeScript classes which are used on the application. Then, in runtime, the translated JSON is set, which allows dynamic translations.

Most systems are single language. In that case, it is recommended to set the translations value statically, so a separated request to fetch the translations is not needed. This is configured in `src/app/setup.ts`. Here is an example for the English translation:

```typescript
import TranslationValues from "i18n/i18n.json";

export function setup() {
  Configuration.staticLocale = "en";
  Configuration.staticTranslations = TranslationValues;
}
```

And here is an example for the Brazilian Portuguese translation:

```typescript
import TranslationValues from "i18n/i18n.pt_BR.json";

export function setup() {
  Configuration.staticLocale = "pt_BR";
  Configuration.staticTranslations = TranslationValues;
}
```

For systems that are multi language, where each user can have distinct languages, a static language should not be set. In this case, the language used by the user in Cyclos will be the one used to fetch the translations in the frontend.

To add a new language locally, simply add the locale to the `locales` array in `ng-translation-gen.json`. Then, to create the file with defaults, or update it with new translation keys, run `npm run merge-translations`. Finally, either reference it as a static translation, or, if the locale matches the language set in Cyclos, it will be automatically used.

The official translations are done at https://crowdin.com/project/cyclos4-ui. If you want to help translating the Cyclos frontend, login to Crowdin and request permission for the project. It has an integration with GitHub, so translations done in Crowdin will be automatically submitted to the project on GitHub. Alternatively, you can submit a GitHub pull request with your translation file.

## Using the login form in a separated application

Some projects have a website for guests which have a login form for Cyclos, for example, using the [Cyclos login plugin for wordpress](https://wordpress.org/plugins/cyclos/). Some projects even handle the public user registration form in these systems.

In these cases, the external system should login the user using an administrator access via the Cyclos API. As result, they get back the user session token. Finally, they should redirect the browser client to the URL to which the Cyclos frontend is deployed, passing the `sessionToken` query parameter, like this: `https://account.mysystem.com/?sessionToken=ABCDEFGH123456`. The frontend will then validate this session token and automatically login the user.

But it is also desirable that whenever the user session expires, the user gets redirected back to the external form for the login, to present users a consistent experience. Similarly, when users logs out of the Cyclos frontend, it would be expected that they are redirected back to the external website on which they logged-in.

These aspects are configured in the `src/app/setup.ts` file, like in this example:

```typescript
export function setup() {
  const externalRoot = "https://www.mysystem.com";
  Configuration.externalLoginUrl = `${externalRoot}/login`;
  Configuration.externalLoginParam = "page";
  Configuration.afterLogoutUrl = externalRoot;
  Configuration.redirectGuests = externalRoot;
}
```

In the example, when the user session expires, for example, when they are in the `/banking/payment` page, the Cyclos frontend will redirect the user to `https://www.mysystem.com/login?page=%2Fbanking%2Fpayment` (which is the URI-encoded value). As such, the external page should present the login form and, after logged-in, the user should be sent back to the frontend on that page, for example, `https://account.mysystem.com/banking/payment?sessionToken=ABCDEFGH123456`. Also, because `redirectGuests` is set, the frontend will not even allow users browsing without being logged-in.

## Deploying to KaiOS

[KaiOS](https://www.kaiostech.com/) is an emerging mobile operating system for "smart feature phones". These devices have 3G/4G, Wi-Fi, camera, but no touch screen. They also have a small screen, usually 240x320px.

A KaiOS application is just a web page that also has a manifest, that is, a descriptor for that application. The manifest is a file named `manifest.webapp` that needs to be served from the same host where the frontend application is. You can create one based on the following template:

```json
{
  "version": "1.0.0",
  "name": "Cyclos",
  "description": "Cyclos banking software",
  "launch_path": "/",
  "icons": {
    "56": "/images/logo_56.png",
    "112": "/images/logo_112.png",
    "128": "/images/logo_128.png"
  },
  "developer": {
    "name": "STRO - Social Trade Organisation",
    "url": "https://www.socialtrade.org"
  },
  "installs_allowed_from": ["*"],
  "orientation": ["landscape-primary"]
}
```

If you're serving the application in a subpath, adjust the URLs accordingly:

```json
{
  "launch_path": "/ui/",
  "icons": {
    "56": "/ui/images/logo_56.png",
    "112": "/ui/images/logo_112.png",
    "128": "/ui/images/logo_128.png"
  }
}
```

You will also have to resize your logo to these pixel sizes, and copy them to the `dist/ui/images` folder (or `dist/images` if running versions previous than 3.0).

Either a physical phone running KaiOS, or the [KaiOS simulator](https://developer.kaiostech.com/getting-started/env-setup/simulator) can be used to test the application. Be aware that the simulator has several known issues (such as only accepting text using the physical PC keyboard) - see the release notes for more details.

The KaiOS application doesn't run in a "browser". Hence, the navigation keys need to be implemented in order for them to work. In this Cyclos frontent, the following keys are mapped:

- Left action: Toggles the sidenav menu;
- Soft right: Runs the action which is represented by an icon in the top right. When not logged-in yet, will go to the login page. When already logged in, will logout if on the dashboard page, or go back to the previous page. There could also have multiple actions. In this case, the icon is &vellip; and activating it will show a menu;
- Vertical arrows: Focus the next / previous field or anchor. On guest home and content pages scroll the page;
- Horizontal arrows: On the quick access navigates through the icons. On search results skips to the next / previous page. On guest home / content pages focus the next / previous anchor;
- Ok: Activates the focused element;
- Numeric keys: On the dashboard will activate the corresponding quick action item.

## Contributing and developing

Please, read the [Wiki pages](https://github.com/cyclosproject/cyclos4-ui/wiki), as they contain important information for development.
