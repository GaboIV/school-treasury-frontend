import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Student } from '../../../models/student.model';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-delete-student-modal',
  templateUrl: './delete-student-modal.component.html',
})
export class DeleteStudentModalComponent implements OnInit {
  @Input() student: Student;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    public modal: NgbActiveModal,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {}

  delete() {
    this.isLoading = true;
    this.studentService.deleteStudent(this.student.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.modal.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al eliminar estudiante';
        console.error('Error al eliminar estudiante', error);
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
