import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { TranslationService } from '../../../../../../modules/i18n';
import { AuthService, UserType } from '../../../../../../modules/auth';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangePasswordModalComponent } from '../../../../layout/modals/change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-user-inner',
  templateUrl: './user-inner.component.html',
})
export class UserInnerComponent implements OnInit, OnDestroy {
  @HostBinding('class')
  class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  language: LanguageFlag;
  user$: Observable<UserType>;
  langs = languages;
  private unsubscribe: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private translationService: TranslationService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.setLanguage(this.translationService.getSelectedLanguage());
  }

  logout() {
    this.auth.logout();
    document.location.reload();
  }

  openChangePasswordModal() {
    const modalRef = this.modalService.open(ChangePasswordModalComponent, {
      centered: true,
      size: 'lg'
    });
  }

  selectLanguage(lang: string) {
    this.translationService.setLanguage(lang);
    this.setLanguage(lang);
    // document.location.reload();
  }

  setLanguage(lang: string) {
    this.langs.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
        this.language = language;
      } else {
        language.active = false;
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  active?: boolean;
}

const languages = [
  {
    lang: 'en',
    name: 'English',
    flag: './assets/media/flags/united-states.svg',
  },
  // {
  //   lang: 'zh',
  //   name: 'Mandarin',
  //   flag: './assets/media/flags/china.svg',
  // },
  {
    lang: 'es',
    name: 'Español',
    flag: './assets/media/flags/peru.svg',
  },
  // {
  //   lang: 'ja',
  //   name: 'Japanese',
  //   flag: './assets/media/flags/japan.svg',
  // },
  // {
  //   lang: 'de',
  //   name: 'German',
  //   flag: './assets/media/flags/germany.svg',
  // },
  // {
  //   lang: 'fr',
  //   name: 'French',
  //   flag: './assets/media/flags/france.svg',
  // },
];
