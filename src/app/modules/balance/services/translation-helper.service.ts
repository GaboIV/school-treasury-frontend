import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationHelperService {
  constructor(private translateService: TranslateService) { }

  translate(key: string): string {
    return this.translateService.instant(key);
  }
}
