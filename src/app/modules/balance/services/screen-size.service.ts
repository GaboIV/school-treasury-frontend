import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, fromEvent } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScreenSizeService {
  private isMobileSubject = new BehaviorSubject<boolean>(this.checkIsMobile());
  public isMobile$: Observable<boolean> = this.isMobileSubject.asObservable();

  constructor() {
    this.setupResizeListener();
  }

  private setupResizeListener(): void {
    fromEvent(window, 'resize')
      .pipe(
        map(() => this.checkIsMobile()),
        startWith(this.checkIsMobile()),
        distinctUntilChanged()
      )
      .subscribe(isMobile => {
        this.isMobileSubject.next(isMobile);
      });
  }

  private checkIsMobile(): boolean {
    return window.innerWidth < 768; // Bootstrap md breakpoint
  }

  public get isMobile(): boolean {
    return this.checkIsMobile();
  }
}
