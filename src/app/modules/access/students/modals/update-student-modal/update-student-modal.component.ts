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
    '003-boy-1.svg',
    '004-boy-2.svg',
    '005-girl-1.svg',
    '006-girl-2.svg',
    '007-boy-3.svg',
    '008-girl-3.svg',
    '009-boy-4.svg',
    '010-girl-4.svg',
    '011-boy-5.svg',
    '012-girl-5.svg'
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
