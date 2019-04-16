# Cyclos 4 user interface

<img src="cyclos.png" align="right" width="120" alt="Cyclos"/>

This project aims to create a modern, simple and intuitive user interface for
[Cyclos](https://www.cyclos.org/) version 4.11 and up. The interface should be easy to customize and add functionality needed by specific projects.

A demo of the front-end can be seen at: https://demo-ui-bar.cyclos.org/

The initial planned scope is to have only end-user functionality in this application. Administration functionality will still be available in Cyclos' default web interface.

## Technical details

- This application is built using [Angular](https://angular.io/) and [Bootstrap](https://getbootstrap.com), using the [ngx-bootstrap](https://valor-software.com/ngx-bootstrap/) integration library;
- It uses Cyclos' REST API for integration. The [ng-openapi-gen](https://github.com/cyclosproject/ng-openapi-gen) project is used to generate the client services and web service models. Starting with Cyclos 4.12, the API will be described using OpenAPI 3 instead of Swagger 2. But a copy of the Cyclos 12 OpenAPI 3 descriptor (which is backwards compatible with 4.11) is already committed in this repository, and is used to generate the services;
- Translations are done separatedly from the Cyclos installation. This way they cannot be customized in Cyclos, but allows the user interface to grow independently from the deployed Cyclos version;
- Requests to the Cyclos server are performed directly from the browser. That means that either this front-end should be deployed in the same domain as Cyclos, or CORS should be enabled in Cyclos by setting `cyclos.cors.origin = <cyclos4-ui-domain>` in the `cyclos.properties` file;
- If you intent to customize or extend the functionality of this frontend, please, refer to the [project Wiki](https://github.com/cyclosproject/cyclos4-ui/wiki). There you will find some useful documentatiton.

## Implemented functionality

As of version 1.0, this frontend implements the following functionality:

- User access: login, logout, forgot password, login with expired password, login with pending agreements (no support for secondary access password);
- Integration with a login form in an external system: receives a pre-created session token and is able to use external URLs for login page and after logout redirect;
- Account history, transfer details;
- Perform payment both to user and system, supports direct, scheduled and recurring payments, indicates if a payment needs authorization;
- Search scheduled / recurring / authorized payments;
- Search users (called business directory, as most systems only allow searching businesses);
- View user profile, with a few actions (perform payment and add to contact list);
- Contact list;
- Manage passwords (change, generate new, unblock, disable / enable);
- Edit own profile (images, basic / custom fields, phones, addresses and additional contact information);
- Public user registration;
- Search advertisements, advertisement details (no shopping cart so far);
- Access notifications, and receive push notifications;
- Run custom operations (self, advertisements and transfers).

More functionality will be added in future versions.

## Requirements

- [Cyclos](https://www.cyclos.org/) version 4.11.2+ (for the backend);
- [NodeJS](https://nodejs.org/) version 8+;
- [NPM](https://www.npmjs.com/) version 5+.

## Getting and preparing the code

First, make sure you have cloned the repository, the current working directory is `cyclos4-ui` and the NPM dependencies are installed (might take a while the first time to download all dependencies):
```bash
git clone https://github.com/cyclosproject/cyclos4-ui.git
cd cyclos4-ui
npm install
```

The project will not compile yet because it depends on classes which are generated by [ng-swagger-gen](https://github.com/cyclosproject/ng-swagger-gen).

## Basic setup

On the `src/app/setup.ts` you will find the file that needs to be configured for your project.
The most important settings are the following:

```typescript
export function setup() {
  Configuration.apiRoot = 'api';
  Configuration.appTitle = 'Cyclos';
  Configuration.appTitleSmall = 'Cyclos frontend';
  Configuration.appTitleMenu = 'Cyclos menu';
}
```

There are plenty of configurations that can be set. Most of them are covered through the various sections of this document. Customizing these settings require a bit of programming in TypeScript. So, using an editor with strong support for the TypeScript language (such as [Visual Studio Code](https://code.visualstudio.com/)) is recommended, specially when requiring a more advanced setup.

## Debugging

To start the development server, with hot reload, which should be accessible at http://localhost:4200/, run the following command:
```bash
npm start
```

## Building

Once you have the configuration set, you can build the user interface by typing:
```bash
npm run build
```

After the build process (which can take a few minutes) you will have the `dist` directory containing the resources that should be deployed to your web server (Apache, Nginx, etc). The same process applies when updating to a new version of the frontend: just update your local copy, for example, with a `git pull` command, build again and re-deploy. Make sure that the folder is completely replaced, so no stale files are left.

Angular assumes the application is deployed in the root path of your domain. For example, this is the case for `https://account.example.org`. If this is not the case, such as `https://www.example.org/path` you need to pass in the path name to Angular at compilation time, like:
```bash
# Replace /path/ with your base path. Don't forget both leading and trailing slashes.
npm run build -- --base-href /path/
```

## Deploying to the server

Angular, by default, uses `HTML5`'s [history.pushState](https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method) method, which produces URLs with paths which are undistinguishable from regular nested paths, but without producing a new request. Besides producing natural URLs, this method allows future expansions, such as using [server-side rendering](https://angular.io/guide/universal).

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

The second approach exposes a directory called `api` in the frontend application. For the browser, that directory is in the same domain as the frontend application itself. On the backend, the HTTP server (for example, Apache) will proxy all requests to `/api` to the Cyclos backend, which probably runs on the same server / datacenter. When proxying, Apache (or other web services) generally add request headers with information about the original request. The de-facto standard header name is `X-Forwarded-For`.

Make sure that in `cyclos.properties` the following is set: `cyclos.header.remoteAddress = X-Forwarded-For`. This is critical, because if multiple logins attempt fails, the remote address is blocked, and this will prevent blocking the backend server's IP address. Also this makes Cyclos log correctly the IP addresses. However, it is also advised to protect against malicious attempts to forge a `X-Forwarded-For` header. As the Cyclos server itself is (probably) already proxied by an Apache (to handle SSL, etc), add in that apache the following rule, to only accept the `X-Forwarded-For` header from the host serving the frontend application:

```apache
RewriteEngine On
# Use the list of accepted IP addresses
RewriteCond %{HTTP:X-Forwarded-For} !(1.1.1.1|2.2.2.2)
RewriteRule .* - [F]
```

To setup the proxy in Apache, make sure the `mod_proxy` and `mod_proxy_http` modules are enabled. Then apply the following configuration, replacing `http://localhost:8888/api` with the correct backend URL (don't forget to include the `/api` in the end):

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

Note that it is important to set `keepalive=On` for [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) to work. It is also recommented to have a timeout larger than 40 seconds, which is the time Cyclos keeps open event stream connections. Also note the `ProxyPassReverseCookiePath` directive. If you happen to have problems logging in while using a proxy is because the cookie path, sent by the backend Tomcat does not match the front-end path visible to users.

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
  </IfModule>
  <IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/* "access plus 1 days"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType text/javascript "access plus 1 year"
  </IfModule>
```

It is safe to set a very large expiration date for CSS / JavaScript files because we explicitly enable the hashing on generated file names, making the file name change whenever the content changes.

## Generating links on the Cyclos backend that point to the frontend

Cyclos generates some links which are sent by e-mail to users. Examples include the e-mail to validate a registration, or some notification. It is desired that when the user clicks on such links, he is forwarded to the deployed front-end application, not to the Cyclos default web interface.

To achieve this, Cyclos allows using a script to generate links. As a global administrator (which may be switched to the network), in 'System > Tools > Script', create a script of type 'Link generation', with the following content:

```groovy
import org.cyclos.impl.utils.LinkType
import org.cyclos.entities.system.ExternalRedirectExecution

if (user != null && user.admin) {
    // Don't generate custom links for admins
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
}
```

Then, in 'System > System configuration > Configurations' select the configuration applied to users (or the default one) and mark the 'Link generation' field for customization. Then select the script you created and set the following as parameters, replacing the URL with your deployed URL:

```properties
rootUrl = https://account.example.com
```

## Customizing layout

There are basically 2 areas where the layout can be customized: modifying the style (CSS) and modifying the configuration.

### Customizing the style

The layout is built using [Bootstrap 4](https://getbootstrap.com/). Bootstrap allows customizing several variables in [SASS](https://sass-lang.com/).

The main file to define these is `src/_definitions.scss`. The most visible changes are the `$primary` and `$secondary` variables, which defines the main colors which are shown in the layout.

It is possible to change the font, by replacing the `$font-import-url` variable by an URL (for example, from Google Fonts) and then the `$font-family-sans-serif` to actually set the font. The default font is Roboto, Android's default font. It is widely used, but lacks support to some character sets. If you use Cyclos in a language that has glyphs not covered by Roboto, you can use, for example, [Noto Sans](https://fonts.google.com/specimen/Noto+Sans). Just take care that the default font weight for bolds used in the frontend is 500, which is not available in Noto Sans. If switching, also change the `$font-weight-bold` to `700`.

You can also create custom styles for the application. To do so, just edit the `src/styles/_custom.scss` file. This is a SASS file, which is a superset of the standard CSS. Note that as styles defined in componenets generally have a greater priority, it might be needed to use the `!important` modifier for the custom definitions to be used.

### Layout configuration

Currently the Cyclos frontend offers the following options in the configuration for layout: Whether to show the menu on desktop on the top bar on in a separated bar, and advertisement category icon customization.

### Use a separated menu bar or join the menu on the top bar

By default, on desktop resolutions, the menu is displayed in a separated bar, below the top bar. An alternative is to have the menu displayed in the top bar itself. To configure this, set in the `src/app/setup.ts` file:

```typescript
export function setup() {
  // true means a separated menu bar, false means joining the menu on the top bar
  Configuration.menuBar = false;
}
```

### Customize the advertisement categories

It is possible to customize the advertisements category icons and colors, which are shown when selecting the marketplace menu item. It is recommended that all the oot advertisement categories in Cyclos have an internal name. The default settings in the frontend matches the categories created by default when creating a network in Cyclos via the wizard. Here is an example of the `src/app/setup.ts` file with the default settings:

```typescript
export function setup() {
  // The key is the ad category internal name, the value defines the icon and color
  Configuration.adCategories = {
    'community': { icon: 'people', color: '#2196f3' },
    'food': { icon: 'restaurant', color: '#f04d4e' },
    'goods': { icon: 'pages', color: '#ff9700' },
    'housing': { icon: 'location_city', color: '#029487' },
    'jobs': { icon: 'work', color: '#8062b3' },
    'labor': { icon: 'business', color: '#de3eaa' },
    'leisure': { icon: 'mood', color: '#687ebd' },
    'services': { icon: 'room_service', color: '#8ec63f' }
  };
}
```

### Customize the custom operations

Similarly to advertisement categories, it is also possible to set a custom icon for custom operations, by internal name. Here is an example of the `src/app/setup.ts`:

```typescript
export function setup() {
  // The key is the custom operation internal name, the value defines the icon
  Configuration.operations = {
    operation1: { icon: 'format_paint' },
    operation2: { icon: 'get_app' }
  };
}
```

```typescript
export function setup() {
  // The key is the ad category internal name, the value defines the icon and color
  Configuration.adCategories = {
    'community': { icon: 'people', color: '#2196f3' },
    'food': { icon: 'restaurant', color: '#f04d4e' },
    'goods': { icon: 'pages', color: '#ff9700' },
    'housing': { icon: 'location_city', color: '#029487' },
    'jobs': { icon: 'work', color: '#8062b3' },
    'labor': { icon: 'business', color: '#de3eaa' },
    'leisure': { icon: 'mood', color: '#687ebd' },
    'services': { icon: 'room_service', color: '#8ec63f' }
  };
}
```

## Customizing content

The Cyclos frontend supports several kinds of content that can be customized:

- The home page, shown for guests;
- What is displayed  inthe dashboard, which is the initial page for logged users;
- Content pages, which are custom pages that show up in the menu;
- Banners, shown on desktop layout.

All these aspects are configured in the `src/app/setup.ts` file. By default, the file `content/home.html` is used to generate the home content for guests. Projects can either customize that file or set a different strategy to fetch the home content. More on this subject is presented ahead. Also, by default, there are no custom content pages or banners.

Every content implement the `Content` interface (defined in `src/app/content/content.ts`) which has a property called `content`. It can either be a string, with the static content (compiled into the code), or a `ContentGetter`, which is able to fetch content from an external source. There are the following built-in `ContentGetter` implementations:

- `ContentGetter.url(url)`: Performs an HTTP GET request and resolves the content body;
- `ContentGetter.image(url)`: Shows an external image;
- `ContentGetter.iframe(url)`: Includes a given page in an IFrame. To make the `iframe` adjust to the content of the contained page, uses the [iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) library, which works even across domains. The requirement is that the loaded page includes the following JavaScript: https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.6.3/iframeResizer.min.js;
- `ContentGetter.cyclosPage(url)`: Fetches the content of a Cyclos floating page, created in 'Content' > 'Content management' > 'Menu and pages'. From there, select a configuration (if multiple), create a new Floating page and, after saving it, copy the URL. That URL is the parameter to be passed as parameter. This implemnentation uses Cyclos' `WEB-RPC` mechanism to fetch the content (as retrieving content pages is not in the Cyclos REST API so far), using the following URL: `<root>/web-rpc/menuEntry/menuItemDetails/<id>`. As such, either Cyclos must be setup to allow CORS requests from the frontend URL, or a proxy should be setup to the `/web-rpc/menuEntry/menuItemDetails/` path, similar to the proxy to `/api` (as described above), and using a relative URL. Example: `/menuItemDetails/*` is proxied to `<root>/web-rpc/menuEntry/menuItemDetails/*`. In such case, the URL parameter would be `menuItemDetails/<id>`.

When content has a `cacheKey`, it is cached locally in the browser, by default, for 1 hour. It is possible to change the `cacheSeconds` property to the desired number. If set to a negative number, the cache will never expire. The cache uses the browser local storage, so clearing the browser cache won't invalidade cached content. Instead, to locally remove cached content, browsers offer ways to remove website data.

The content object defining the home page is a `ContentWithLayout`, which also adds the following:

- `layout`: Can be either `full`, indicating that the content takes the entire available width and height, or `card`, in which case the content is shown inside a regular box, optionally with a title. When not set will be either `full` or `card` depending on whether there's a title or not;
- `title`: The title used when `layout` is `card`.

Here is an example to setup the home page for guests pointing to a content page in Cyclos, and thus, with the possibility to customize it directly from the Cyclos server:

```typescript
export function setup() {
  // This example uses the full URL, assuming the Cyclos server has CORS enabled
  Configuration.homePage = {
    content: ContentGetter.cyclosPage('https://my-cyclos-instance/web-rpc/menuEntry/menuItemDetails/124356723644')
  };
}
```

So, fetching content for the home page is straightforward. Content pages and banners, on the other hand, require a bit more work, as described below.

### Content pages

Custom content pages can be very useful for projects that want to add a manual, some additional information pages, simple contact forms and so on. They are available both for guests and logged users, and in case of logged users, can be placed in a dedicated root menu item (internally called `content`) or in some other root menu (banking, marketplace or personal). **Important:** For logged users, if there is at least one visible content page with full layout, the root menu will be a dropdown, as the left menu will not be shown on full layout. However, if all pages for logged users use the `card` layout, then a side menu will be shown. For guests we never show a left menu, so the content menu is always a dropdown.

To enable content pages you must create an implementation of the `ContentPagesResolver` interface, defined in `src/app/content/content-pages-resolver.ts`. It has a single method called `contentPages`, receiving the The Angular injector reference (used to obtain shared services) and must return either a `ContentPage[]` or an observable of it. Then, in the `app/setup.ts` file, instantiate that class, like this:

```typescript
import { ExampleContentPagesResolver } from 'app/content/example-content-pages-resolver';

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

Here are are some examples: [one that uses some static pages](https://github.com/cyclosproject/cyclos4-ui/blob/master/src/environments/example-content-pages-resolver.ts) and [one that fetches pages from a Wordpress instance](https://github.com/cyclosproject/cyclos4-ui/blob/master/src/app/content/wordpress-content-pages-resolver.ts) (needs the full URL to the WordPress REST API as constructor argument).

### Banners

Banners are shown in cards (boxes) below the left menu in the large layout. No banners are ever shown in mobile or in the dashboard page. Each card has one or more banners. When there are multiple banners, they will rotate after a given number of seconds.

To use banners you must create an implementation of the `BannerCardsResolver` interface, defined in `src/app/content/banner-cards-resolver.ts`. It has a single method called `bannerCards`, receiving the The Angular injector reference (used to obtain shared services) and must return either a `BannerCard[]` or an observable of it. Then, in the `app/setup.ts` file, create an instance of that class, like this:

```typescript
import { ExampleBannerCardsResolver } from 'app/content/example-banner-cards-resolver';

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

There is [an example BannerCardsResolver here](https://github.com/cyclosproject/cyclos4-ui/blob/master/src/environments/example-banner-cards-resolver.ts).

### Customizing the dashboard

The dashboard is the home page for logged users. It contains several items that present useful information for users. Each item is an independent component that can be customized. Also, each item can be enabled only for some resolution breakpoints, namely:

- `xxs`: Very small displays, such as KaiOS' smart feature phones;
- `xs`: Mobile devices  / very small browser windows;
- `sm`: Tablets in portrait mode / small desktop windows;
- `md`: Tablets in landscape mode / medium desktop windows;
- `lg`: Desktop browsers with not-so-large resolutions;
- `xg`: Desktop browsers with large resolutions.

Also, greater-than and lower-than variations are available: `gt-xxs` (`xxs` or greater) up to `gt-lg`, as well as `lt-xg` up to `lt-xs`.

When displayed on desktop, the dashboard has 3 columns: `left`, `right` and `full` (presented below). Each item defines on which column it is shown.

The following dashboard items are available:

- **Quick access**: Presents a list with links to common actions. Each link has an icon and a label. Allows specifying which links are shown and on which resolution breakpoints they are shown;
- **Account status**: Shows relevant data for an account, namely the current balance, a chart with the account balance over the last few months and a list with the last incoming transfers. Also has a button to view the account history;
- **Latest advertisements**: Shows some of the lastest advertisements;
- **Latest users**: Shows some of the users that have been activated last;
- **Content**: Shows a custom content.

The default dashboard is comprised of:

- Quick access on all breakpoints, but only showing account links for `lt-md`, as larger breakpoints will have a dedicated account status item;
- Account status for each account the logged user has, only for breakpoint `gt-sm`;
- Latest advertisements, only for breakpoint `gt-sm`;
- A content page, showing a sample events static page, on all breakpoints.

Generally projects need to customize a few aspects of the default dashboard, such as removing the latest ads or replacing it by latest users, and to show another content item. The easiest way to accomplish this is to extend the `DefaultDashboardResolver` class, which is defined in `src/environments/default-dashboard-resolver.ts` file. Then override the `dashboardItems` method to add only the desired items. If the only customization is to replace the content item for another page, just override the `contentPage` method to return the alternative page, don't override the `dashboardItems` method.

It is also possible to do a completely different dashboard, skipping the `DefaultDashboardResolver` class entirely. Finally, set your custom `DashboardResolver` instance like this in :

```typescript
import { CustomDashboardResolver } from 'app/custom-dashboard-resolver';

export function setup() {
  Configuration.dashboard = new CustomDashboardResolver();
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
import TranslationValues from 'i18n/i18n.json';

export function setup() {
  Configuration.staticLocale = 'en';
  Configuration.staticTranslations = TranslationValues;
}
```

And here is an example for the Brazilian Portuguese translation:

```typescript
import TranslationValues from 'i18n/i18n.pt_BR.json';

export function setup() {
  Configuration.staticLocale = 'pt_BR';
  Configuration.staticTranslations = TranslationValues;
}
```

For systems that are multi language, where each user can have distinct languages, a static language should not be set. In this case, the language used by user in Cyclos will be the one used to fetch the translations in the front-end.

To add a new language locally, simply add the locale to the `locales` array in `ng-translation-gen.json`. Then, to create the file with defaults, or update it with new translation keys, run `npm run merge-translations`. Finally, either reference it as a static translation, or, if the locale matches the language set in Cyclos, it will be automatically used.

The official translations are done at https://crowdin.com/project/cyclos4-ui. If you want to help translating the Cyclos frontend, login to Crowdin and request permission for the project. It has an integration with GitHub, so translations done in Crowdin will be automatically submitted to the project on GitHub. Alternatively, you can submit a GitHub pull request with your translation file.

## Using the login form in a separated application

Some projects have a website for guests which have a login form for Cyclos, for example, using the [Cyclos login plugin for wordpress](https://br.wordpress.org/plugins/cyclos/). Some projects even handle the public user registration form in these systems.

In these cases, the external system should login the user using an administrator access via the Cyclos API. As result, they get back the user session token. Finally, they should redirect the browser client to the URL to which the Cyclos frontend is deployed, passing the `sessionToken` query parameter, like this: `https://account.mysystem.com/?sessionToken=ABCDEFGH123456`. The frontend will then validate this session token and automatically login the user.

But it is also desirable that whenever the user session expires, the user gets redirected back to the external form for the login, to present users a consistent experience. Similarly, when users logs out of the Cyclos frontend, it would be expected that they are redirected back to the external website on which they logged-in.

These aspects are configured in the `src/app/setup.ts` file, like in this example:

```typescript
export function setup() {
  const externalRoot = 'https://www.mysystem.com';
  Configuration.externalLoginUrl = `${externalRoot}/login`;
  Configuration.externalLoginParam = 'page';
  Configuration.afterLogoutUrl = externalRoot;
  Configuration.redirectGuests = externalRoot;
}
```

In the example, when the user session expires, for example, when they are in the `/banking/payment` page, the Cyclos frontend will redirect the user to `https://www.mysystem.com/login?page=%2Fbanking%2Fpayment` (which is the URI-encoded value). As such, the external page should present the login form and, after logged-in, the user should be sent back to the frontend on that page, for example, `https://account.mysystem.com/banking/payment?sessionToken=ABCDEFGH123456`. Also, because `redirectGuests` is set, the frontend will not even allow users browsing without being logged-in.
