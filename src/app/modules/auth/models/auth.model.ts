export class AuthModel {
  authToken: string;
  refreshToken: string;
  expiresIn: Date;
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: number;
  studentId?: string;
  hasChangedPassword?: boolean;
  fcmToken?: string;

  setAuth(auth: AuthModel) {
    this.authToken = auth.authToken;
    this.refreshToken = auth.refreshToken;
    this.expiresIn = auth.expiresIn;
    this.id = auth.id;
    this.username = auth.username;
    this.email = auth.email;
    this.fullName = auth.fullName;
    this.role = auth.role;
    this.studentId = auth.studentId;
    this.hasChangedPassword = auth.hasChangedPassword;
    this.fcmToken = auth.fcmToken;
  }
}
