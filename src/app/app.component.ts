import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslationService } from './modules/i18n';
// language list
import { locale as enLang } from './modules/i18n/vocabs/en';
import { locale as chLang } from './modules/i18n/vocabs/ch';
import { locale as esLang } from './modules/i18n/vocabs/es';
import { locale as jpLang } from './modules/i18n/vocabs/jp';
import { locale as deLang } from './modules/i18n/vocabs/de';
import { locale as frLang } from './modules/i18n/vocabs/fr';
import { ThemeModeService } from './_metronic/partials/layout/theme-mode-switcher/theme-mode.service';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

@Component({
  // tslint:disable-next-line:component-selector
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AppComponent implements OnInit {
  constructor(
    private translationService: TranslationService,
    private modeService: ThemeModeService
  ) {
    // register translations
    this.translationService.loadTranslations(
      esLang,
      enLang,
      chLang,
      jpLang,
      deLang,
      frLang
    );
  }

  ngOnInit() {
    this.modeService.init();
    this.registerPushNotifications();
  }

  registerPushNotifications() {
    if (Capacitor.isNativePlatform()) {
      console.log('Plataforma nativa detectada, registrando notificaciones push...');
      PushNotifications.requestPermissions().then(permission => {
        if (permission.receive === 'granted') {
          PushNotifications.register();
        }
      });

      PushNotifications.addListener('registration', (token) => {
        console.log('Token de FCM:', token.value);
        localStorage.setItem('fcm_token', token.value);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Notificación recibida:', notification);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error en registro de notificaciones:', error);
      });
    } else {
      console.log('Plataforma web detectada, no se registrarán notificaciones push nativas.');
    }
  }
}
