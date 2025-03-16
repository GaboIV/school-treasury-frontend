import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Student } from '../models/student.model';
import { StudentService } from '../services/student.service';
import { CreateStudentModalComponent } from './modals/create-student-modal/create-student-modal.component';
import { UpdateStudentModalComponent } from './modals/update-student-modal/update-student-modal.component';
import { DeleteStudentModalComponent } from './modals/delete-student-modal/delete-student-modal.component';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  isLoading: boolean = false;

  constructor(
    private studentService: StudentService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents() {
    this.isLoading = true;
    this.studentService.getStudents().subscribe({
      next: (response) => {
        this.students = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar estudiantes', error);
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    const modalRef = this.modalService.open(CreateStudentModalComponent, { size: 'lg' });
    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadStudents();
        }
      },
      () => {}
    );
  }

  openUpdateModal(student: Student) {
    const modalRef = this.modalService.open(UpdateStudentModalComponent, { size: 'lg' });
    modalRef.componentInstance.student = student;
    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadStudents();
        }
      },
      () => {}
    );
  }

  openDeleteModal(student: Student) {
    const modalRef = this.modalService.open(DeleteStudentModalComponent, { size: 'sm' });
    modalRef.componentInstance.student = student;
    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadStudents();
        }
      },
      () => {}
    );
  }

  getAvatarPath(avatar: string): string {
    return `./assets/media/svg/avatars/${avatar}`;
  }
}
