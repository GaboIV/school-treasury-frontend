// USA
export const locale = {
  lang: 'en',
  data: {
    TRANSLATOR: {
      SELECT: 'Select your language',
    },
    MENU: {
      NEW: 'new',
      ACTIONS: 'Actions',
      CREATE_POST: 'Create New Post',
      PAGES: 'Pages',
      FEATURES: 'Features',
      APPS: 'Apps',
      DASHBOARD: 'Dashboard',
      BALANCE: 'Balance',
      ACCESS: 'Access'
    },
    AUTH: {
      GENERAL: {
        OR: 'Or',
        SUBMIT_BUTTON: 'Submit',
        NO_ACCOUNT: 'Don\'t have an account?',
        SIGNUP_BUTTON: 'Sign Up',
        FORGOT_BUTTON: 'Forgot Password',
        BACK_BUTTON: 'Back',
        PRIVACY: 'Privacy',
        LEGAL: 'Legal',
        CONTACT: 'Contact',
      },
      LOGIN: {
        TITLE: 'Login Account',
        BUTTON: 'Sign In',
      },
      FORGOT: {
        TITLE: 'Forgotten Password?',
        DESC: 'Enter your email to reset your password',
        SUCCESS: 'Your account has been successfully reset.'
      },
      REGISTER: {
        TITLE: 'Sign Up',
        DESC: 'Enter your details to create your account',
        SUCCESS: 'Your account has been successfuly registered.'
      },
      INPUT: {
        EMAIL: 'Email',
        FULLNAME: 'Fullname',
        PASSWORD: 'Password',
        CONFIRM_PASSWORD: 'Confirm Password',
        USERNAME: 'Username'
      },
      VALIDATION: {
        INVALID: '{{name}} is not valid',
        REQUIRED: '{{name}} is required',
        MIN_LENGTH: '{{name}} minimum length is {{min}}',
        AGREEMENT_REQUIRED: 'Accepting terms & conditions are required',
        NOT_FOUND: 'The requested {{name}} is not found',
        INVALID_LOGIN: 'The login detail is incorrect',
        REQUIRED_FIELD: 'Required field',
        MIN_LENGTH_FIELD: 'Minimum field length:',
        MAX_LENGTH_FIELD: 'Maximum field length:',
        INVALID_FIELD: 'Field is not valid',
      }
    },
    ECOMMERCE: {
      COMMON: {
        SELECTED_RECORDS_COUNT: 'Selected records count: ',
        ALL: 'All',
        SUSPENDED: 'Suspended',
        ACTIVE: 'Active',
        FILTER: 'Filter',
        BY_STATUS: 'by Status',
        BY_TYPE: 'by Type',
        BUSINESS: 'Business',
        INDIVIDUAL: 'Individual',
        SEARCH: 'Search',
        IN_ALL_FIELDS: 'in all fields'
      },
      ECOMMERCE: 'eCommerce',
      CUSTOMERS: {
        CUSTOMERS: 'Customers',
        CUSTOMERS_LIST: 'Customers list',
        NEW_CUSTOMER: 'New Customer',
        DELETE_CUSTOMER_SIMPLE: {
          TITLE: 'Customer Delete',
          DESCRIPTION: 'Are you sure to permanently delete this customer?',
          WAIT_DESCRIPTION: 'Customer is deleting...',
          MESSAGE: 'Customer has been deleted'
        },
        DELETE_CUSTOMER_MULTY: {
          TITLE: 'Customers Delete',
          DESCRIPTION: 'Are you sure to permanently delete selected customers?',
          WAIT_DESCRIPTION: 'Customers are deleting...',
          MESSAGE: 'Selected customers have been deleted'
        },
        UPDATE_STATUS: {
          TITLE: 'Status has been updated for selected customers',
          MESSAGE: 'Selected customers status have successfully been updated'
        },
        EDIT: {
          UPDATE_MESSAGE: 'Customer has been updated',
          ADD_MESSAGE: 'Customer has been created'
        }
      }
    },
    MYBALANCE: {
      MYBALANCE: 'My Balance',
      MYPAYMENTS: 'My Payments',
      PAYMENTREQUESTS: 'Payment Requests',
      REGISTER_PAYMENT: 'Register Payment',
      REQUEST_PAYMENT_REGISTRATION: 'Request Payment Registration',
      AMOUNT_TO_PAY: 'Amount to Pay',
      RECEIPT_IMAGES: 'Receipt Images',
      PAYMENT_PROOF_IMAGES: 'Payment Proof Images',
      ADJUSTED_AMOUNT_NOTE: 'This payment has an adjusted amount. The student must pay',
      SURPLUS_NOTE: 'The difference of {{amount}} will go to petty cash',
      PAYMENT_REQUEST_INFO: 'This request will be reviewed by an administrator before being approved. Make sure to attach clear and legible receipts.',
      SEND_REQUEST: 'Send Request'
    },
    BALANCE: {
      SUMMARY: 'Summary',
      EXPENSES: 'Expenses',
      INCOME: 'Income',
      COLLECTIONS: 'Collections',
      PETTY_CASH: 'Petty Cash',
      PETTY_CASH_BALANCE: 'Balance',
      PETTY_CASH_TRANSACTIONS: 'Transactions',
      PETTY_CASH_INCOME: 'Income',
      PETTY_CASH_COLLECTION: 'Payment Details',
      PAYMENT_REQUESTS_MANAGEMENT: 'Requests Management',
      PAYMENT_REQUESTS: {
        TITLE: 'Payment Requests',
        CREATE: 'Create Request',
        EDIT: 'Edit Request',
        VIEW: 'View Request',
        LIST: 'Request List',
        STUDENT: 'Student',
        AMOUNT: 'Amount',
        DATE: 'Date',
        COMMENT: 'Comment',
        IMAGES: 'Images',
        STATUS: 'Status',
        ACTIONS: 'Actions',
        PENDING: 'Pending',
        UNDER_REVIEW: 'Under Review',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
        NEEDS_CHANGES: 'Needs Changes',
        APPROVE: 'Approve',
        REJECT: 'Reject',
        REQUEST_CHANGES: 'Request Changes',
        ADD_COMMENT: 'Add Comment',
        ADMIN_COMMENTS: 'Admin Comments',
        UPLOAD_IMAGES: 'Upload Images',
        DELETE_CONFIRMATION: 'Are you sure you want to delete this request?'
      }
    },
    COLLECTIONS: {
      COLLECTIONTYPES: 'Collection Types',
      COLLECTIONS: 'Collections List'
    },
    ACCESS: {
      ROLES: 'Roles',
      STUDENTS: 'Students',
      STUDENTS_DESCRIPTION: 'List of registered students',
      STUDENT_NAME: 'Student name',
      AVATAR: 'Avatar',
      CREATE_STUDENT: 'Create student',
      UPDATE_STUDENT: 'Update student',
      DELETE_STUDENT: 'Delete student',
      DELETE_STUDENT_CONFIRMATION: 'Are you sure you want to delete this student? This action cannot be undone.',
      GENERATE_USER: 'Generate User',
      GENERATE_USER_SUCCESS: 'User generated successfully',
      GENERATE_USER_ERROR: 'Error generating user'
    },
    GENERAL: {
      ADD: 'Add',
      SAVE: 'Save',
      CANCEL: 'Cancel',
      DELETE: 'Delete',
      UPDATE_DATA: 'Update Data',
      PAYMENT_INFORMATION: 'Payment Information',
      STUDENT: 'Student',
      COLLECTION: 'Collection',
      INDIVIDUAL_AMOUNT: 'Individual Amount',
      ADJUSTED_AMOUNT: 'Adjusted Amount',
      SURPLUS: 'Surplus (petty cash)',
      AMOUNT_PAID: 'Amount Paid',
      PENDING: 'Pending',
      PARTIAL: 'Partial',
      PAID: 'Paid',
      SURPLUS_STATUS: 'Surplus',
      UNKNOWN: 'Unknown',
      CONCEPT: 'Concept',
      ORIGINAL_AMOUNT: 'Original Amount',
      AMOUNT: 'Amount',
      NOTE: 'Note',
      INSTEAD_OF: 'instead of',
      PAYMENT_DATE: 'Payment Date',
      COMMENT_OPTIONAL: 'Comment (optional)',
      COMMENT: 'Comment',
      IMAGES: 'Images',
      STATUS: 'Status',
      NOT_REGISTERED: 'Not registered',
      DRAG_DROP_HERE: 'Drag and drop images here',
      OR_CLICK_TO_SELECT: 'or click anywhere in this area to select files',
      ADD_MORE: 'Add more',
      ALLOWED_FORMATS: 'Allowed formats: JPG, PNG, GIF. Maximum size: 5MB per image',
      ERROR_OCCURRED: 'An error occurred. Please try again.',
      SUCCESS: 'Success',
      ERROR: 'Error'
    },
    VALIDATION: {
      REQUIRED: 'This field is required',
      MIN_LENGTH: 'Minimum length is {{min}} characters',
      AMOUNT_REQUIRED: 'Amount is required',
      AMOUNT_MAX: 'Amount cannot be greater than pending amount',
      PAYMENT_DATE_REQUIRED: 'Payment date is required',
      IMAGES_REQUIRED: 'At least one receipt image is required'
    },
    PROFILE: {
      LANGUAGE: 'Language'
    }
  }
};
