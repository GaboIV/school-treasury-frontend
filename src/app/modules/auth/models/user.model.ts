import { AuthModel } from './auth.model';
import { AddressModel } from './address.model';
import { SocialNetworksModel } from './social-networks.model';

export class UserModel extends AuthModel {
  password: string;
  fullname: string;
  pic: string;
  // La propiedad role ya está definida en AuthModel
  roles: number[] = []; // Array de roles para compatibilidad
  occupation: string;
  companyName: string;
  phone: string;
  address?: AddressModel;
  socialNetworks?: SocialNetworksModel;
  // personal information
  firstname: string;
  lastname: string;
  website: string;
  // account information
  language: string;
  timeZone: string;
  communication: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  // email settings
  emailSettings?: {
    emailNotification: boolean;
    sendCopyToPersonalEmail: boolean;
    activityRelatesEmail: {
      youHaveNewNotifications: boolean;
      youAreSentADirectMessage: boolean;
      someoneAddsYouAsAsAConnection: boolean;
      uponNewOrder: boolean;
      newMembershipApproval: boolean;
      memberRegistration: boolean;
    };
    updatesFromKeenthemes: {
      newsAboutKeenthemesProductsAndFeatureUpdates: boolean;
      tipsOnGettingMoreOutOfKeen: boolean;
      thingsYouMissedSindeYouLastLoggedIntoKeen: boolean;
      newsAboutMetronicOnPartnerProductsAndOtherServices: boolean;
      tipsOnMetronicBusinessProducts: boolean;
    };
  };

  setUser(_user: unknown) {
    const user = _user as UserModel;
    this.id = user.id;
    this.username = user.username || '';
    this.password = user.password || '';
    this.fullname = user.fullname || '';
    this.studentId = user.studentId || '';
    this.email = user.email || '';
    this.pic = user.pic || './assets/media/avatars/blank.png';

    // Asegurarse de que role tenga un valor válido
    console.log("UserModel: Valor original de role:", user.role);
    this.role = user.role !== undefined ? user.role : 0; // Valor por defecto: 0 (Administrador)

    // Asegurarse de que roles sea un array
    console.log("UserModel: Valor original de roles:", user.roles);
    this.roles = Array.isArray(user.roles) ? user.roles : [this.role];

    // Procesar el estado de cambio de contraseña solo si viene definido
    if (user.hasChangedPassword !== undefined) {
      console.log("UserModel: Valor original de hasChangedPassword:", user.hasChangedPassword);
      // No realizamos ninguna transformación, solo asignamos
      this.hasChangedPassword = user.hasChangedPassword;
      console.log("UserModel: hasChangedPassword asignado:", this.hasChangedPassword);
    } else {
      console.log("UserModel: hasChangedPassword no definido en objeto de entrada");
    }

    console.log("UserModel: Valores finales:", {
      role: this.role,
      roles: this.roles,
      hasChangedPassword: this.hasChangedPassword
    });

    this.occupation = user.occupation || '';
    this.companyName = user.companyName || '';
    this.phone = user.phone || '';
    this.address = user.address;
    this.socialNetworks = user.socialNetworks;
  }
}
