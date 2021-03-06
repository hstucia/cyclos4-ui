import { ChangeDetectionStrategy, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataForUi } from 'app/api/models';
import { DataForUiHolder } from 'app/core/data-for-ui-holder';
import { StateManager } from 'app/core/state-manager';
import { I18n } from 'app/i18n/i18n';
import { handleKeyboardFocus, setRootSpinnerVisible } from 'app/shared/helper';
import { ArrowsVertical, ShortcutService } from 'app/core/shortcut.service';
import { Configuration } from 'app/ui/configuration';
import { BannerService } from 'app/ui/core/banner.service';
import { BreadcrumbService } from 'app/ui/core/breadcrumb.service';
import { LoginState } from 'app/ui/core/login-state';
import { LoginService } from 'app/ui/core/login.service';
import { MenuService } from 'app/ui/core/menu.service';
import { SidenavComponent } from 'app/ui/core/sidenav.component';
import { UiLayoutService } from 'app/ui/core/ui-layout.service';
import { BehaviorSubject } from 'rxjs';
import { UiErrorHandlerService } from 'app/ui/core/ui-error-handler.service';

@Component({
  selector: 'ui-root',
  templateUrl: './ui.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiComponent implements OnInit {

  @ViewChild(SidenavComponent) sidenav: SidenavComponent;
  @ViewChild('mainContainer') mainContainer: ElementRef;

  initialized$ = new BehaviorSubject(false);
  loggingOut$ = new BehaviorSubject(false);

  title: string;
  menuBar: boolean;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private dataForUiHolder: DataForUiHolder,
    public login: LoginService,
    public loginState: LoginState,
    public menu: MenuService,
    public layout: UiLayoutService,
    private banner: BannerService,
    public i18n: I18n,
    private stateManager: StateManager,
    private breadcrumb: BreadcrumbService,
    private shortcut: ShortcutService,
    private uiErrorHandler: UiErrorHandlerService
  ) {
  }

  ngOnInit() {
    window['navigate'] = (url: string | HTMLAnchorElement, event?: Event) => {
      this.ngZone.run(() => {
        if (typeof url === 'object') {
          url = url.href;
        }
        this.menu.navigate({ url, event });
      });
    };
    this.menuBar = Configuration.menuBar;
    this.banner.initialize();
    this.uiErrorHandler.initialize();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.dataForUiHolder.subscribe(dataForUi => {
      if (dataForUi != null) {
        this.doInitialize(dataForUi);
      }
    });
    if (this.dataForUiHolder.dataForUi) {
      this.doInitialize(this.dataForUiHolder.dataForUi);
    }
    this.loginState.subscribeForLoggingOut(flag => this.loggingOut$.next(flag));

    // Some browsers (like Firefox) show an outline on focused anchors.
    // After the page is loaded, blur the menus, so none will be outlined
    this.layout.currentPage$.subscribe(() => {
      const focused = document.activeElement as HTMLElement;
      if (focused.tagName === 'A') {
        try {
          focused.blur();
        } catch (e) { }
      }
    });

    // Indicate that Cyclos has finished loading, to prevent the root spinner from being shown on the onload event
    self['cyclosLoaded'] = true;

    // Hide the spinner, showing the application
    setRootSpinnerVisible(false);

    // Listen for vertical arrows events on mobile to change focus
    this.shortcut.subscribe(ArrowsVertical, e =>
      handleKeyboardFocus(this.layout, this.mainContainer.nativeElement, e));
  }

  private doInitialize(dataForUi: DataForUi) {
    this.initialized$.next(true);

    // Handle redirects on urgent situations
    const auth = (dataForUi || {}).auth || {};
    let redirect: string = null;
    if (auth.expiredPassword) {
      redirect = '/expired-password';
    } else if (auth.pendingAgreements) {
      redirect = '/pending-agreements';
    }
    if (redirect && this.router.url !== redirect) {
      setTimeout(() => {
        this.breadcrumb.clear();
        this.stateManager.clear();
        this.router.navigateByUrl(redirect);
      }, 1);
    }
  }
}
