import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { StudentsComponent } from './students/students.component';
import { CreateStudentModalComponent } from './students/modals/create-student-modal/create-student-modal.component';
import { UpdateStudentModalComponent } from './students/modals/update-student-modal/update-student-modal.component';
import { DeleteStudentModalComponent } from './students/modals/delete-student-modal/delete-student-modal.component';
import { DropdownMenusModule, WidgetsModule } from '../../_metronic/partials';
import { SharedModule } from '../../_metronic/shared/shared.module';
import { TranslationModule } from '../i18n/translation.module';
import { AccessRoutingModule } from './access-routing.module';
import { AccessComponent } from './access.component';

@NgModule({
  declarations: [
    AccessComponent,
    StudentsComponent,
    CreateStudentModalComponent,
    UpdateStudentModalComponent,
    DeleteStudentModalComponent
  ],
  imports: [
    CommonModule,
    AccessRoutingModule,
    DropdownMenusModule,
    WidgetsModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    TranslationModule
  ],
})
export class AccessModule {}
