import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LogSettingsComponent } from './log-settings/log-settings.component';

@NgModule({
  declarations: [
    LogSettingsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        children: [
          {
            path: 'logs',
            component: LogSettingsComponent
          },
          { path: '', redirectTo: 'logs', pathMatch: 'full' },
          { path: '**', redirectTo: 'logs', pathMatch: 'full' },
        ]
      }
    ])
  ]
})
export class SettingsModule { }
