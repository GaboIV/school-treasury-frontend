import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Student } from '../../../models/student.model';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-update-student-modal',
  templateUrl: './update-student-modal.component.html',
})
export class UpdateStudentModalComponent implements OnInit {
  @Input() student: Student;
  form: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  avatars: string[] = [
    '001-boy.svg',
    '002-girl.svg',
    '003-girl-1.svg',
    '004-boy-1.svg',
    '005-girl-2.svg',
    '006-girl-3.svg',
    '007-boy-2.svg',
    '008-boy-3.svg',
    '009-boy-4.svg',
    '010-girl-4.svg',
    '011-boy-5.svg',
    '012-girl-5.svg',
    '013-girl-6.svg',
    '014-girl-7.svg',
    '015-boy-6.svg',
    '016-boy-7.svg',
    '017-girl-8.svg',
    '018-girl-9.svg',
    '019-girl-10.svg',
    '020-girl-11.svg',
    '021-boy-8.svg',
    '022-girl-12.svg',
    '023-girl-13.svg',
    '024-boy-9.svg',
    '025-girl-14.svg',
    '026-boy-10.svg',
    '027-girl-15.svg',
    '028-girl-16.svg',
    '029-boy-11.svg',
    '030-girl-17.svg',
    '031-boy-12.svg',
    '032-boy-13.svg',
    '033-girl-18.svg',
    '034-boy-14.svg',
    '035-boy-15.svg',
    '036-girl-19.svg',
    '037-girl-20.svg',
    '038-boy-16.svg',
    '039-girl-21.svg',
    '040-boy-17.svg',
    '041-girl-22.svg',
    '042-girl-23.svg',
    '043-boy-18.svg',
    '044-boy-19.svg',
    '045-boy-20.svg',
    '046-girl-24.svg',
    '047-girl-25.svg',
    '048-boy-21.svg',
    '049-boy-22.svg',
    '050-girl-26.svg',
    'blank.svg'
  ];
  selectedAvatar: string;

  constructor(
    private fb: FormBuilder,
    public modal: NgbActiveModal,
    private studentService: StudentService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      avatar: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.selectedAvatar = this.student.avatar;
    this.form.patchValue({
      name: this.student.name,
      avatar: this.student.avatar
    });
  }

  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
    this.form.patchValue({
      avatar: avatar
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.studentService.updateStudent(this.student.id, this.form.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.modal.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al actualizar estudiante';
        console.error('Error al actualizar estudiante', error);
      }
    });
  }

  cancel() {
    this.modal.dismiss();
  }

  getAvatarPath(avatar: string): string {
    return `./assets/media/svg/avatars/${avatar}`;
  }
}
