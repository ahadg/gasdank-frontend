import { AppointmentType, BrandListType, CustomersType, DepartmentType, DoctorListType, DoctorsType, Employee, FilesType, InvoicesType, PatientsType, PaymentType, ReviewType, SellersType, SocialUserType, TransactionType, UserType } from "@/types/data";
import product1 from '@/assets/images/products/logo/logo-1.svg';
import product4 from '@/assets/images/products/logo/logo-4.svg';
import product5 from '@/assets/images/products/logo/logo-5.svg';
import product6 from '@/assets/images/products/logo/logo-6.svg';
import product8 from '@/assets/images/products/logo/logo-8.svg';

import doctors5 from '@/assets/images/users/doctors/dr-five.jpg';
import doctors4 from '@/assets/images/users/doctors/dr-four.jpg';
import doctors1 from '@/assets/images/users/doctors/dr-one.jpg';
import doctors6 from '@/assets/images/users/doctors/dr-six.jpg';
import doctors3 from '@/assets/images/users/doctors/dr-three.jpg';
import doctors2 from '@/assets/images/users/doctors/dr-two.jpg';

import masterCard from '@/assets/images/cards/mastercard.svg';
import payoneer from '@/assets/images/cards/payoneer.svg';
import paypalCard from '@/assets/images/cards/paypal.svg';
import stripeCard from '@/assets/images/cards/stripe.svg';
import unionpayCard from '@/assets/images/cards/unionpay.svg';
import visaCard from '@/assets/images/cards/visa.svg';
import avatar1 from '@/assets/images/users/avatar-1.jpg';
import avatar10 from '@/assets/images/users/avatar-10.jpg';
import avatar2 from '@/assets/images/users/avatar-2.jpg';
import avatar3 from '@/assets/images/users/avatar-3.jpg';
import avatar4 from '@/assets/images/users/avatar-4.jpg';
import avatar5 from '@/assets/images/users/avatar-5.jpg';
import avatar6 from '@/assets/images/users/avatar-6.jpg';
import avatar7 from '@/assets/images/users/avatar-7.jpg';
import avatar8 from '@/assets/images/users/avatar-8.jpg';
import avatar9 from '@/assets/images/users/avatar-9.jpg';

import userAvatar2 from '@/assets/images/users/avatar-2.jpg';
import userAvatar5 from '@/assets/images/users/avatar-5.jpg';
import userAvatar8 from '@/assets/images/users/avatar-8.jpg';

import department1 from '@/assets/images/department/d-1.png';
import department2 from '@/assets/images/department/d-2.png';
import department3 from '@/assets/images/department/d-3.png';
import department4 from '@/assets/images/department/d-4.png';
import department5 from '@/assets/images/department/d-5.png';
import department6 from '@/assets/images/department/d-6.png';
import department7 from '@/assets/images/department/d-7.png';
import department8 from '@/assets/images/department/d-8.png';

import sellers1 from '@/assets/images/sellers/s-1.svg';
import sellers4 from '@/assets/images/sellers/s-4.svg';
import sellers6 from '@/assets/images/sellers/s-6.svg';
import sellers7 from '@/assets/images/sellers/s-7.svg';
import sellers8 from '@/assets/images/sellers/s-8.svg';
import sellers2 from '@/assets/images/sellers/s-2.svg';



import { addOrSubtractDaysFromDate } from "@/utils/date";
import { currency } from "@/context/constants";

export const brandListData: BrandListType[] = [
  {
    id: '101',
    name: 'Zaroan - Brazil',
    category: 'Clothing',
    image: product1,
    since: 2020,
    Stores: '1.5k',
    products: '8,950',
  },
  {
    id: '102',
    name: 'Jocky-Johns - USA',
    category: 'Clothing',
    image: product4,
    since: 1985,
    Stores: '205',
    products: '1,258',
  },
  {
    id: '103',
    name: 'Ginne - India',
    category: 'Lifestyle',
    image: product5,
    since: 2001,
    Stores: '89',
    products: '338',
  },
  {
    id: '104',
    name: 'DDoen - Brazil',
    category: 'Fashion',
    image: product6,
    since: 1995,
    Stores: '650',
    products: '6,842',
  },
  {
    id: '105',
    name: 'Zoddiak - Canada',
    category: 'Clothing',
    image: product8,
    since: 1963,
    Stores: '109',
    products: '952',
  },
]

export const doctorsData: DoctorsType[] = [
  {
    id: '301',
    name: 'Dr. Master Gulati',
    image: doctors1,
    position: 'Dental Specialist',
    rating: {
      star: 5,
      review: 580
    }
  },
  {
    id: '302',
    name: 'Dr. David Wilson',
    image: doctors4,
    position: 'Ophthalmologist',
    rating: {
      star: 4.3,
      review: 295
    }
  },
  {
    id: '303',
    name: 'Dr. Robert Brown',
    image: doctors2,
    position: 'General Specialist',
    rating: {
      star: 5,
      review: 405
    }
  },
  {
    id: '304',
    name: 'Dr. Michael Johnson',
    image: doctors5,
    position: 'Neurologist',
    rating: {
      star: 4.1,
      review: 120
    }
  },
  {
    id: '305',
    name: 'Dr. Emily Davis',
    image: doctors3,
    position: 'Pediatrician',
    rating: {
      star: 5,
      review: 385
    }
  },
  {
    id: '306',
    name: 'Dr. Alice Smith',
    image: doctors6,
    position: 'Cardiologist',
    rating: {
      star: 4,
      review: 92
    }
  },
  {
    id: '307',
    name: ' Dr. Anna Martinez',
    image: doctors5,
    position: 'Cardiologist',
    rating: {
      star: 5.2,
      review: 108
    }
  },
  {
    id: '308',
    name: 'Dr. Elijah Wylde',
    image: doctors5,
    position: 'Cardiologist',
    rating: {
      star: 5.2,
      review: 108
    }
  },
  {
    id: '309',
    name: 'Dr.Madeline Panton',
    image: doctors5,
    position: 'Cardiologist',
    rating: {
      star: 5.2,
      review: 108
    }
  },
  {
    id: '310',
    name: 'Dr.Angus Rich',
    image: doctors5,
    position: 'Cardiologist',
    rating: {
      star: 5.2,
      review: 108
    }
  },
]

export const appointmentsData: AppointmentType[] = [
  {
    id: '401',
    doctorsId: '301',
    name: 'John Anderson',
    gender: 'Male',
    age: 38,
    appointment: 'General Checkup',
    date: addOrSubtractDaysFromDate(10),
    appointmentStatus: 'Completed',
    phone: '(567) 890-1234',
    department: 'Cardiology',
    reasonVisit: 'Annual Check-up',
  },
  {
    id: '402',
    doctorsId: '302',
    name: 'Jane Smith',
    gender: 'female',
    age: 45,
    appointment: 'Annual Physical',
    date: addOrSubtractDaysFromDate(110),
    appointmentStatus: 'Completed',
    phone: '(456) 789-0123',
    department: 'Dermatology',
    reasonVisit: 'Consultation',
  },
  {
    id: '403',
    doctorsId: '303',
    name: 'Mark Brown',
    gender: 'Male',
    age: 52,
    appointment: 'Follow-up',
    date: addOrSubtractDaysFromDate(210),
    appointmentStatus: 'Canceled',
    phone: '(345) 678-9012',
    department: 'Pediatrics',
    reasonVisit: 'Lab Results Review',
  },
  {
    id: '404',
    doctorsId: '304',
    name: 'Lisa White',
    gender: 'female',
    age: 34,
    appointment: 'Consultation',
    date: addOrSubtractDaysFromDate(20),
    appointmentStatus: 'Scheduled',
    phone: '(234) 567-8901',
    department: 'Orthopedics',
    reasonVisit: 'Cardiology Follow-up',
  },
  {
    id: '405',
    doctorsId: '305',
    name: 'Tom Clark',
    gender: 'Male',
    age: 29,
    appointment: 'Dental Checkup',
    date: addOrSubtractDaysFromDate(320),
    appointmentStatus: 'Completed',
    phone: '(123) 456-7890',
    department: 'Neurology',
    reasonVisit: 'Blood Pressure Check',
  },
  {
    id: '406',
    doctorsId: '306',
    name: 'Susan Green',
    gender: 'female',
    age: 40,
    appointment: 'Wellness Visit',
    date: addOrSubtractDaysFromDate(98),
    appointmentStatus: 'Canceled',
    phone: '(567) 890-1234',
    department: 'Gastroenterology',
    reasonVisit: 'Annual Check-up',
  },
  {
    id: '407',
    doctorsId: '307',
    name: 'Robert Walker',
    gender: 'Male',
    age: 55,
    appointment: 'Eye Exam',
    date: addOrSubtractDaysFromDate(98),
    appointmentStatus: 'Completed',
    phone: '(567) 890-1234',
    department: 'Oncology',
    reasonVisit: 'Annual Check-up',
  },
]

export const transactionData: TransactionType[] = [
  {
    id: '501',
    businessName: 'Adam M',
    description: 'Licensing Revenue',
    amount: `USD ${currency}750.00`,
    date: addOrSubtractDaysFromDate(16),
    paymentType: 'Credit',
    paymentImage: masterCard,
    variant: 'success',
    paymentMethod: '*3954',
    paymentStatus: 'Success'
  },
  {
    id: '502',
    businessName: 'Alexa Newsome',
    image: avatar2,
    description: 'Invoice #1908',
    amount: `-AUD ${currency}90.99`,
    variant: 'danger',
    date: addOrSubtractDaysFromDate(160),
    paymentType: 'Debit',
    paymentImage: visaCard,
    paymentMethod: '*9003',
    paymentStatus: 'Success'
  },
  {
    id: '503',
    businessName: 'Payoneer',
    image: payoneer,
    description: 'Client Payment',
    amount: `CAD ${currency}190.00`,
    variant: 'success',
    date: addOrSubtractDaysFromDate(320),
    paymentType: 'Credit',
    paymentImage: masterCard,
    paymentMethod: '*3954',
    paymentStatus: 'Success'
  },
  {
    id: '504',
    businessName: 'Payoneer',
    image: payoneer,
    description: 'Client Payment',
    amount: `CAD ${currency}190.00`,
    date: addOrSubtractDaysFromDate(320),
    paymentImage: unionpayCard,
    paymentMethod: '*8751',
    paymentStatus: 'Failed'
  },
  {
    id: '505',
    businessName: 'Shelly Dorey',
    description: 'Custom Software Development',
    amount: `USD ${currency}500.00`,
    paymentType: 'Credit',
    variant: 'success',
    date: addOrSubtractDaysFromDate(320),
    paymentImage: paypalCard,
    paymentMethod: 'PayPal',
    paymentStatus: 'Success'
  },
  {
    id: '506',
    businessName: 'Fredrick Arnett',
    image: avatar5,
    description: 'Envato Payout - Collaboration',
    amount: `USD ${currency}1250.95`,
    // paymentType: 'Credit',
    date: addOrSubtractDaysFromDate(320),
    paymentImage: stripeCard,
    paymentMethod: 'Stripe',
    paymentStatus: 'Onhold'
  },
  {
    id: '507',
    businessName: 'Barbara Frink',
    image: avatar4,
    description: 'Personal Payment',
    amount: `-AUD ${currency}90.99`,
    variant: 'danger',
    paymentType: 'Debit',
    date: addOrSubtractDaysFromDate(320),
    paymentImage: visaCard,
    paymentMethod: '*9003',
    paymentStatus: 'Success'
  },
]

export const userData: UserType[] = [
  {
    id: '1001',
    name: 'Brandon Smith',
    image: userAvatar2,
    email: 'harriettepenix@rhyta.com',
    message: 'How are you today?',
    unRead: 3,
    date: addOrSubtractDaysFromDate(10),
    activeOffline: 'Active'
  },
  {
    id: '1002',
    name: 'James Zavel',
    image: userAvatar5,
    email: 'harriettepenix@rhyta.com',
    message: "Hey! a reminder for tommorow's meeting...",
    isSend: true,
    date: addOrSubtractDaysFromDate(15),
    activeOffline: 'Typing,,,,'
  },
  {
    id: '1003',
    name: 'Maria Lopez',
    image: userAvatar8,
    email: 'harriettepenix@rhyta.com',
    message: 'How are you today?',
    unRead: 1,
    date: addOrSubtractDaysFromDate(202),
    activeOffline: 'Active'
  },
  {
    id: '1004',
    name: 'Osen Discussion',
    message: "JS Developer's Come in office?",
    email: 'harriettepenix@rhyta.com',
    date: addOrSubtractDaysFromDate(89),
    allMessage: true,
    activeOffline: 'Offline'
  },
  {
    id: '1005',
    name: 'Eunice Bennett',
    image: avatar3,
    email: 'harriettepenix@rhyta.com',
    message: 'Please check these design assets',
    date: addOrSubtractDaysFromDate(15),
    isSend: false,
    activeOffline: 'Active'
  },
  {
    id: '1006',
    name: 'Javascript Team',
    icon: 'tabler:brand-javascript',
    message: 'New Project?',
    isSend: true,
    email: 'harriettepenix@rhyta.com',
    iconColor: 'warning',
    date: addOrSubtractDaysFromDate(202),
    activeOffline: 'Active'
  },
  {
    id: '1006',
    name: 'UI Team',
    icon: 'tabler:brand-figma',
    message: 'Project Completed',
    isSend: true,
    email: 'harriettepenix@rhyta.com',
    iconColor: 'secondary',
    date: addOrSubtractDaysFromDate(305),
    activeOffline: 'Offline'
  },
  {
    id: '1007',
    name: 'Hoyt Bahe',
    image: avatar4,
    message: 'Voice Message',
    isSend: true,
    email: 'harriettepenix@rhyta.com',
    voiceMessage: true,
    date: addOrSubtractDaysFromDate(860),
    activeOffline: 'Active'
  },
  {
    id: '1008',
    name: 'John Otta',
    image: avatar9,
    message: 'What next plan ?',
    isSend: true,
    email: 'harriettepenix@rhyta.com',
    date: addOrSubtractDaysFromDate(175),
    activeOffline: 'Typing,,,,'
  },
  {
    id: '1009',
    name: 'Louis Moller',
    image: avatar6,
    message: 'Are you free for 15 min?',
    unRead: 1,
    email: 'harriettepenix@rhyta.com',
    date: addOrSubtractDaysFromDate(65),
    activeOffline: 'Active'
  },
  {
    id: '1010',
    name: 'David Callan',
    image: avatar9,
    message: 'Are you interested in learning?',
    unRead: 3,
    email: 'harriettepenix@rhyta.com',
    date: addOrSubtractDaysFromDate(16),
    activeOffline: 'Offline'
  },
  {
    id: '1011',
    name: 'Sean Lee',
    image: avatar9,
    message: 'Howdy?',
    isSend: true,
    email: 'harriettepenix@rhyta.com',
    date: addOrSubtractDaysFromDate(84),
    activeOffline: 'Active'
  },
  {
    id: '1012',
    name: 'React Team',
    message: '@jamesZavel Is new React employee',
    isSend: true,
    iconColor: 'primary',
    email: 'harriettepenix@rhyta.com',
    date: addOrSubtractDaysFromDate(46),
    icon: 'tabler:brand-react',
    activeOffline: 'Active'
  },
]

export const socialUserData: SocialUserType[] = [
  {
    id: '151',
    name: 'Harriett E. Penix',
    email: 'harriettepenix@rhyta.com',
    image: avatar1,
    BirthDate: '1 January 1980',
    phone: '(567) 890-1234'
  },
  {
    id: '152',
    name: 'Carol L. Simon',
    email: 'carollcimon@jourrapide.com',
    image: avatar2,
    BirthDate: '2 February 1975',
    phone: '(456) 789-0123'
  },
  {
    id: '153',
    name: 'Rosa L. Winters',
    email: 'rosalwinters@teleworm.us',
    image: avatar3,
    phone: '(345) 678-9012',
    BirthDate: '1 May 1989',
  },
  {
    id: '154',
    name: 'Jeremy C. Willi',
    email: 'jeremycwilliams@dayrep.com',
    image: avatar4,
    BirthDate: '4 April 1985',
    phone: '(234) 567-8901'
  },
  {
    id: '155',
    name: 'James R. Alvares',
    email: 'jamesralvares@jourrapide.com',
    image: avatar5,
    BirthDate: '5 May 1982',
    phone: '(123) 456-7890'
  },
  {
    id: '156',
    name: 'Kathleen R. Stewart',
    email: 'kathleenr@jourrapide.com',
    image: avatar6,
    BirthDate: '6 June 1978',
    phone: '1-567-890-1234'
  },
  {
    id: '157',
    name: 'Debra R. Morgan',
    email: 'Debra@jourrapide.com',
    image: avatar7,
    BirthDate: '7 July 1987',
    phone: '(456) 789 0123'
  },
  {
    id: '158',
    name: 'Mark J. Scott',
    email: 'DebraMark@jourrapide.com',
    image: avatar8,
    BirthDate: '8 August 1981',
    phone: '345 678 9012'
  },
  {
    id: '159',
    name: 'Connie R. Kilmer',
    email: 'DebraMark@jourrapide.com',
    image: avatar9,
    BirthDate: '9 September 1979',
    phone: '234.567.8901'
  },
  {
    id: '160',
    name: 'Paul K. Coyle',
    email: 'PaulaMark@jourrapide.com',
    image: avatar10,
    BirthDate: '10 October 1983',
    phone: '123-456-7890'
  },
]

export const filesData: FilesType[] = [
  {
    id: '2001',
    title: 'Dashboard-requirements.docx',
    icon: 'tabler:file-type-docx',
    file: '12 Docx',
    fileVariant: 'info',
    userId: '151',
    date: addOrSubtractDaysFromDate(21),
    size: 128,
    members: [
      {
        text: 'D',
        variant: 'success'
      },
      {
        text: 'K',
        variant: 'primary'
      },
      {
        text: 'H',
        variant: 'secondary'
      },
      {
        text: 'L',
        variant: 'warning'
      },
      {
        text: 'G',
        variant: 'info'
      },
    ]
  },
  {
    id: '2002',
    title: 'ocen-dashboard.pdf',
    icon: 'tabler:file-type-pdf',
    file: '18 Pdf',
    fileVariant: 'danger',
    userId: '152',
    date: addOrSubtractDaysFromDate(210),
    size: 521,
    members: [
      {
        text: 'Y',
        variant: 'danger'
      },
      {
        text: 'L',
        variant: 'success'
      },
      {
        text: 'O',
        variant: 'dark'
      },
      {
        text: 'J',
        variant: 'warning'
      },
      {
        text: 'G',
        variant: 'primary'
      },
    ]
  },
  {
    id: '2003',
    title: 'Dashboard tech requirements',
    icon: 'tabler:files',
    file: '12 File',
    fileVariant: 'warning',
    userId: '153',
    date: addOrSubtractDaysFromDate(100),
    size: 7.2,
    members: [
      {
        text: 'A',
        variant: 'primary'
      },
      {
        text: 'B',
        variant: 'warning'
      },
      {
        text: 'R',
        variant: 'danger'
      },
      {
        text: 'C',
        variant: 'secondary'
      },
      {
        text: 'U',
        variant: 'dark'
      },
    ]
  },
  {
    id: '2004',
    title: 'dashboard.jpg',
    icon: 'tabler:file-type-jpg',
    file: '172 Jpg Photo',
    fileVariant: 'primary',
    userId: '154',
    date: addOrSubtractDaysFromDate(354),
    size: 54.2,
    members: [
      {
        text: 'L',
        variant: 'warning'
      },
      {
        text: 'Y',
        variant: 'secondary'
      },
      {
        text: 'A',
        variant: 'dark'
      },
      {
        text: 'R',
        variant: 'primary'
      },
      {
        text: 'V',
        variant: 'info'
      },
    ]
  },
  {
    id: '2005',
    title: 'admin-hospital.zip',
    icon: 'tabler:file-type-zip',
    file: 'admin-hospital.zip',
    fileVariant: 'success',
    userId: '155',
    date: addOrSubtractDaysFromDate(45),
    size: 8.3,
    members: [
      {
        text: 'G',
        variant: 'dark'
      },
      {
        text: 'O',
        variant: 'danger'
      },
      {
        text: 'W',
        variant: 'secondary'
      },
      {
        text: 'A',
        variant: 'primary'
      },
      {
        text: 'K',
        variant: 'warning'
      },
    ]
  },
]

export const doctorListData: DoctorListType[] = [
  {
    id: '501',
    image: avatar3,
    name: 'Dr. James D. Roger',
    specialty: 'Cardiology',
    number: '96 303-975-3491',
    email: 'jamesdroger@armyspy.com',
    timing: 'Mon-Fri: 9 AM - 5 PM',
    location: '3544 Rainbow Drive Akron, OH',
    position: 'Chief of Surgery / CHO',
    specialNotes: 'Specializes in robotics',
    locationKm: '600m',
    ratingStar: 4.5,
    experience: 14
  },
  {
    id: '502',
    image: avatar2,
    name: ' Dr. Morgan H. Beck',
    specialty: 'Dermatology',
    number: '56 408-272-5403',
    email: 'morganhbeck@rhyta.com',
    timing: 'Mon-Fri: 10 AM - 6 PM',
    location: '1234 Maple Street Springfield , USA',
    position: 'Head of Pediatrics',
    specialNotes: 'Fluent in Spanish',
    locationKm: '1.4km',
    ratingStar: 4.4,
    experience: 9
  },
  {
    id: '503',
    image: avatar4,
    name: 'Dr. Terry J. Bowers',
    specialty: 'Pediatrics',
    number: '92 845-693-5084',
    email: 'terryjbowers@teleworm.us',
    timing: 'Tue-Sat: 8 AM - 4 PM',
    location: '1487 Marconi St Pimville 1809',
    position: 'Senior Nurse',
    specialNotes: 'CPR instructor',
    locationKm: '1.1km',
    ratingStar: 4.2,
    experience: 12
  },
  {
    id: '504',
    image: avatar5,
    name: 'Dr. Carlos McCollum',
    specialty: 'Orthopedics',
    number: '68 036961 83 22',
    email: 'carloslmccollum@rhyta.com',
    timing: 'Mon-Thu: 9 AM - 5 PM',
    location: '2425 Bhoola Road Nahoon 12, USA',
    position: 'Pediatric Nurse',
    specialNotes: 'Expert in anxiety disorders',
    locationKm: '900m',
    ratingStar: 4.3,
    experience: 17
  },
  {
    id: '505',
    image: avatar6,
    name: ' Dr. Jeanetta D. Hovey',
    specialty: 'Neurology',
    number: '62 0951 29 41 23',
    email: 'jeanettadhovey@jourrapide.com',
    timing: 'Wed-Sat: 1 PM - 9 PM',
    location: 'Casper Fagel straat 331 NT, USA',
    position: 'Lead Psychiatrist',
    specialNotes: 'Certified lactation consultant',
    locationKm: '10km',
    ratingStar: 4.1,
    experience: 10
  },
  {
    id: '506',
    image: avatar7,
    name: 'Dr. Erma D. Coffman',
    specialty: 'Gastroenterology',
    number: '44 06588 19 07 95',
    email: 'ermadcoffman@jourrapide.com',
    timing: 'Mon-Sat: 6 AM - 2 PM',
    location: 'Sneeuwbes 17 2318 AR Leiden',
    position: 'Cardiology Nurse',
    specialNotes: 'Medical instructor',
    locationKm: '6km',
    ratingStar: 4.2,
    experience: 6
  },
  {
    id: '507',
    image: avatar8,
    name: 'Dr. Dorian T. Lackey',
    specialty: 'Oncology',
    number: '41 02161 72 22 77',
    email: 'doriantlackey@teleworm.us',
    timing: 'Fri-Sun: 9 AM - 5 PM',
    location: '85 Elkview Drive Miami, FL 33128',
    position: 'Orthopedic Surgeon',
    specialNotes: 'Specializes in Orthopedics',
    locationKm: '2.1km',
    ratingStar: 3.5,
    experience: 4
  },
  {
    id: '508',
    image: avatar9,
    name: 'Dr. Kelli H. Bailey',
    specialty: 'Psychiatry',
    number: '99 073 38 56 39',
    email: 'kelligbailey@rhyta.com',
    timing: 'Mon-Fri: 8 AM - 4 PM',
    location: '1468 Mahlon Street Dunellen, NJ',
    position: 'Radiologist',
    specialNotes: 'Major Radiology',
    locationKm: '500m',
    ratingStar: 4.4,
    experience: 12
  },
  {
    id: '509',
    image: avatar10,
    name: 'Dr. Robert A. Camp',
    specialty: 'Endocrinology',
    number: '9 08684 81 00 91',
    email: 'robertacampbell@armyspy.com',
    timing: 'Tue-Sat: 9 AM - 5 PM',
    location: '3544 Rainbow Drive Akron, OH',
    position: 'Neurologist',
    specialNotes: 'Specializes in IBD',
    locationKm: '600m',
    ratingStar: 4.5,
    experience: 19
  },
  {
    id: '510',
    image: avatar1,
    name: 'Dr. Jewel B. Odom',
    specialty: 'Ophthalmology',
    number: '41 0451 67 15 47',
    email: 'jewelbodom@armyspy.com',
    timing: 'Mon-Thu: 10 AM - 6 PM',
    location: '1234 Maple Street Springfield , USA',
    position: 'Oncologist',
    specialNotes: 'Expert in anxiety disorders',
    locationKm: '1.5km',
    ratingStar: 4.5,
    experience: 3
  },
]

export const patientsData: PatientsType[] = [
  {
    id: '801',
    userId: '151',
    gender: 'Male',
    bloodGroup: 'A+',
    address: '123 Main St, City, ST',
    physician: 'Dr. James D. Roger'
  },
  {
    id: '802',
    userId: '152',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '456 Elm St, City, ST',
    physician: 'Dr. Morgan H. Beck'
  },
  {
    id: '803',
    userId: '153',
    gender: 'Female',
    bloodGroup: 'A-',
    address: '789 Pine St, City, ST',
    physician: 'Dr. Terry J. Bowers'
  },
  {
    id: '804',
    userId: '154',
    gender: 'Male',
    bloodGroup: 'B+',
    address: '101 Maple St, City, ST',
    physician: 'Dr. James D. Roger'
  },
  {
    id: '805',
    userId: '155',
    gender: 'Male',
    bloodGroup: 'AB-',
    address: '202 Oak St, City, ST',
    physician: 'Dr. Kelli H. Bailey'
  },
  {
    id: '806',
    userId: '156',
    gender: 'Male',
    bloodGroup: 'O-',
    address: '303 Cedar St, City, ST',
    physician: 'Dr. Terry J. Bowers'
  },
  {
    id: '807',
    userId: '157',
    gender: 'Female',
    bloodGroup: 'A+',
    address: '404 Birch St, City, ST',
    physician: 'Dr. Kelli H. Bailey'
  },
  {
    id: '808',
    userId: '158',
    gender: 'Male',
    bloodGroup: 'B-',
    address: '505 Walnut St, City, ST',
    physician: 'Dr. Carlos McCollum'
  },
  {
    id: '809',
    userId: '159',
    gender: 'Female',
    bloodGroup: 'AB+',
    address: '606 Spruce St, City, ST',
    physician: 'Dr. Morgan H. Beck'
  },
  {
    id: '810',
    userId: '160',
    gender: 'Female',
    bloodGroup: 'O+',
    address: '707 Redwood St, City, ST',
    physician: 'Dr. Kelli H. Bailey'
  },
]

export const paymentData: PaymentType[] = [
  {
    id: '901',
    userId: '151',
    doctorsId: '301',
    insuranceComp: 'Tata MediCare Insurance',
    billDate: addOrSubtractDaysFromDate(2),
    charge: 1500,
    tax: 15,
    discount: 10,
    total: 1500
  },
  {
    id: '902',
    userId: '152',
    doctorsId: '302',
    insuranceComp: 'Star Health insurance',
    billDate: addOrSubtractDaysFromDate(2),
    charge: 1500,
    tax: 10,
    discount: 10,
    total: 3500
  },
  {
    id: '903',
    userId: '153',
    doctorsId: '303',
    insuranceComp: 'Apollo Health Insurance',
    billDate: addOrSubtractDaysFromDate(2),
    charge: 1500,
    tax: 11,
    discount: 10,
    total: 5000
  },
  {
    id: '904',
    userId: '154',
    doctorsId: '304',
    insuranceComp: 'LIC Health Insurance',
    billDate: addOrSubtractDaysFromDate(2),
    charge: 1500,
    tax: 10,
    discount: 10,
    total: 1500
  },
  {
    id: '905',
    userId: '155',
    doctorsId: '305',
    insuranceComp: 'National Insurance',
    billDate: addOrSubtractDaysFromDate(2),
    charge: 1500,
    tax: 18,
    discount: 10,
    total: 3500
  },
  {
    id: '906',
    userId: '156',
    doctorsId: '306',
    insuranceComp: 'Star Health insurance',
    billDate: addOrSubtractDaysFromDate(2),
    charge: 1500,
    tax: 18,
    discount: 10,
    total: 5000
  },
  {
    id: '907',
    userId: '157',
    doctorsId: '307',
    insuranceComp: 'LIC Health Insurance',
    billDate: addOrSubtractDaysFromDate(2),
    charge: 1500,
    tax: 10,
    discount: 10,
    total: 5000
  },
  {
    id: '908',
    userId: '158',
    doctorsId: '308',
    insuranceComp: 'General Insurance Limited',
    billDate: addOrSubtractDaysFromDate(2),
    charge: 1322,
    tax: 18,
    discount: 10,
    total: 2300
  },
  {
    id: '909',
    userId: '159',
    doctorsId: '309',
    insuranceComp: 'Insurance Company Limited',
    billDate: addOrSubtractDaysFromDate(2),
    charge: 1500,
    tax: 10,
    discount: 10,
    total: 4800
  },
  {
    id: '910',
    userId: '160',
    doctorsId: '310',
    insuranceComp: 'LIC Health Insurance',
    billDate: addOrSubtractDaysFromDate(2),
    charge: 2500,
    tax: 18,
    discount: 10,
    total: 4000
  },
]

export const departmentData: DepartmentType[] = [
  {
    id: '601',
    title: 'Cardiology Department',
    image: department1,
    description: 'Cardiologists diagnose and treat conditions such as congenital heart defects, coronary artery disease, heart failure, and valvular heart disease.',
    rating: {
      star: 4.5,
      review: 4.5,
    },
    bestDoctor: [
      {
        image: avatar10,
        name: 'Vicki',
      },
      {
        name: 'T',
        variant: 'dark',
        textVariant: 'dark'
      },
      {
        image: avatar1,
        name: 'Chris'
      }
    ]
  },
  {
    id: '602',
    title: 'Pediatrics Department',
    image: department2,
    description: 'Pediatricians are trained to diagnose and treat a wide range of childhood illnesses, from minor health problems to serious diseases.',
    rating: {
      star: 4.5,
      review: 3.1,
    },
    bestDoctor: [
      {
        image: avatar3,
        name: 'Vicki',
      },
      {
        image: avatar2,
        name: 'Vicki'
      },
      {
        image: avatar5,
        name: 'Chris'
      }
    ]
  },
  {
    id: '603',
    title: 'Orthopedic Department',
    image: department3,
    description: 'Orthopedic surgeons specialize in surgeries involving bones, joints, ligaments, tendons, and muscles. ',
    rating: {
      star: 5,
      review: 1.4,
    },
    bestDoctor: [
      {
        image: avatar4,
        name: 'Vicki',
      },
      {
        image: avatar7,
        name: 'Vicki',
      },
      {
        name: 'S',
        variant: 'dark',
        textVariant: 'success'
      },
    ]
  },
  {
    id: '604',
    title: 'Oncology Department',
    image: department4,
    description: 'Oncologists are medical professionals who manage the care of patients with cancer,radiation therapy, and surgical interventions.',
    rating: {
      star: 4.5,
      review: 2.5,
    },
    bestDoctor: [
      {
        image: avatar9,
        name: 'Vicki',
      },
      {
        image: avatar3,
        name: 'Vicki'
      },
      {
        name: 'A',
        variant: 'dark',
        textVariant: 'primary'
      },
    ]
  },
  {
    id: '605',
    title: 'Ophthalmologist Department',
    image: department5,
    description: 'Ophthalmologists are medical doctors specializing in eye and vision care, including medical and surgical treatments.',
    rating: {
      star: 4.5,
      review: 3.1,
    },
    bestDoctor: [
      {
        name: 'P',
        variant: 'dark',
        textVariant: 'info'
      },
      {
        name: 'D',
        variant: 'dark',
        textVariant: 'warning'
      },
      {
        name: 'A',
        variant: 'dark',
        textVariant: 'primary'
      },
    ]
  },
  {
    id: '606',
    title: 'Imaging Department',
    image: department6,
    description: 'Common types of medical imaging include X-rays, computed tomography (CT) scans, magnetic resonance imaging (MRI), and ultrasound.',
    rating: {
      star: 4.5,
      review: 2.7,
    },
    bestDoctor: [
      {
        image: avatar10,
        name: 'Vicki',
      },
      {
        image: avatar8,
        name: 'Vicki'
      },
      {
        name: 'M',
        variant: 'dark',
        textVariant: 'primary'
      },
    ]
  },
  {
    id: '607',
    title: 'Gastroenterology Department',
    image: department7,
    description: 'Gastroenterologists diagnose and treat conditions affecting the gastrointestinal tract, including the esophagus, stomach , liver, pancreas.',
    rating: {
      star: 4.5,
      review: 1.9,
    },
    bestDoctor: [
      {
        image: avatar3,
        name: 'Vicki',
      },
      {
        image: avatar5,
        name: 'Vicki'
      },
      {
        image: avatar7,
        name: 'Vicki'
      },
    ]
  },
  {
    id: '608',
    title: 'Neurology Department',
    image: department8,
    description: "Neurologists diagnose and treat conditions such as epilepsy, multiple sclerosis, Parkinson's disease, and stroke.",
    rating: {
      star: 4.5,
      review: 2.1,
    },
    bestDoctor: [
      {
        image: avatar2,
        name: 'Vicki',
      },
      {
        name: 'A',
        variant: 'dark',
        textVariant: 'primary'
      },
      {
        image: avatar6,
        name: 'Vicki',
      },
    ]
  },
]

export const reviewData: ReviewType[] = [
  {
    id: '701',
    doctorsId: '501',
    rating: {
      star: 4.9,
      review: 2.3,
    },
    reviews: [
      {
        name: 'Oliver Baynton',
        star: 5,
        description: "Dr. James Roger is exceptional. A great listener and communicator. Makes our family's health a top priority. Highly recommended",
        like: 632,
        dislike: 9,
        date: addOrSubtractDaysFromDate(10)
      },
      {
        name: 'Jonathan Hort',
        star: 5,
        description: "Our family doctor, provides outstanding care. Always prompt, understanding, and offers excellent guidance. We couldn't ask for a better healthcare partner. Compassionate, thorough, and always available when needed. Our family's health is in capable hands.",
        like: 212,
        dislike: 4,
        date: addOrSubtractDaysFromDate(56)
      },
    ]
  },
  {
    id: '702',
    doctorsId: '502',
    rating: {
      star: 4.7,
      review: 1.6,
    },
    reviews: [
      {
        name: 'Hugo Strele',
        star: 5,
        description: "He genuinely cares about our family's health and goes above and beyond to ensure we receive the best care possible.",
        like: 322,
        dislike: 8,
        date: addOrSubtractDaysFromDate(30)
      },
      {
        name: 'Mackenzie McHale',
        star: 5,
        description: "Dr. Morgan Beck is a true gem. Always attentive, patient, and knowledgeable. Takes time to explain things and makes us feel at ease during. provides outstanding care. Always prompt, understanding, and offers excellent guidance. We couldn't ask for a better healthcare partner.",
        like: 532,
        dislike: 43,
        date: addOrSubtractDaysFromDate(5)
      },
    ]
  },
  {
    id: '703',
    doctorsId: '503',
    rating: {
      star: 4.5,
      review: 2.5,
    },
    reviews: [
      {
        name: 'Lauren Oberg',
        star: 5,
        description: 'Dr. Roger consistently goes the extra mile, making him our trusted choice for medical advice and treatment.',
        like: 452,
        dislike: 23,
        date: addOrSubtractDaysFromDate(70)
      },
      {
        name: 'Ralph Kappel',
        star: 4.5,
        description: 'Dr. Terry Bowers was exceptional. They took the time to listen attentively to our concerns and attentively to our concerns thoroughly explain everything in a way that was easy to understand. Their expertise and compassionate approach reassured us throughout the appointment.',
        like: 621,
        dislike: 60,
        date: addOrSubtractDaysFromDate(85)
      },
    ]
  },
  {
    id: '704',
    doctorsId: '504',
    rating: {
      star: 4.1,
      review: 4.2,
    },
    reviews: [
      {
        name: 'Anja Bachmeier',
        star: 4,
        description: 'I am incredibly grateful for the care I received at ortho care. Thanks to their expertise and dedication, I am now on the road to recovery.',
        like: 841,
        dislike: 20,
        date: addOrSubtractDaysFromDate(10)
      },
      {
        name: 'Jan Fuhrmann',
        star: 4.5,
        description: 'I am incredibly grateful for the care I received at [Orthopedics Practice Name]. Thanks to their expertise and attentively to our concerns dedication, I am now on the road to recovery. I highly recommend ortho care to anyone in need of orthopedic care."',
        like: 732,
        dislike: 120,
        date: addOrSubtractDaysFromDate(150)
      },
    ]
  },
  {
    id: '705',
    doctorsId: '505',
    rating: {
      star: 4.3,
      review: 3.7,
    },
    reviews: [
      {
        name: 'Katja Theissen',
        star: 4.5,
        description: 'The nursing staff and medical assistants were also fantastic. They were attentive, caring, and always willing to answer any questions I had.',
        like: 287,
        dislike: 0,
        date: addOrSubtractDaysFromDate(78)
      },
      {
        name: 'Torsten Fisher',
        star: 4.5,
        description: 'Dr. Erma Coffman is a true professional. They took the time to listen attentively to my symptoms, a comprehensive examination, and explained my diagnosis and treatment options clearly. Their expertise and genuine concern for my well-being were evident throughout our consultation.',
        like: 400,
        dislike: 80,
        date: addOrSubtractDaysFromDate(210)
      },
    ]
  },
  {
    id: '706',
    doctorsId: '506',
    rating: {
      star: 3.5,
      review: 8,
    },
    reviews: [
      {
        name: 'Lukas Kastner',
        star: 4,
        description: 'The entire atmosphere at Psycho is calming and conducive to healing. The support staff were always helpful, ensuring my visits were stress-free.',
        like: 79,
        dislike: 2,
        date: addOrSubtractDaysFromDate(150)
      },
      {
        name: 'Martina Hofmann',
        star: 4.5,
        description: 'I have seen significant improvements in my mental health since starting treatment with Dr. Kelli Bailey . I would highly recommend Psycho to anyone seeking compassionate and effective psychiatry care. They were accommodating and made me feel comfortable right from the start."',
        like: 128,
        dislike: 23,
        date: addOrSubtractDaysFromDate(210)
      },
    ]
  },
]

export const customersData: CustomersType[] = [
  {
    id: '521',
    userId: '151',
    invoice: 'INV-103452',
    status: 'Active',
    totalAmount: 532.75,
    amountDue: 123.45,
    shopRate: 30,
    dueDate: addOrSubtractDaysFromDate(10)
  },
  {
    id: '522',
    userId: '152',
    invoice: 'INV-984321',
    status: 'Block',
    totalAmount: 689.50,
    amountDue: 234.56,
    shopRate: 70,
    dueDate: addOrSubtractDaysFromDate(150)
  },
  {
    id: '523',
    userId: '153',
    invoice: 'INV-567890',
    status: 'Active',
    totalAmount: 745.60,
    amountDue: 498.76,
    shopRate: 40,
    dueDate: addOrSubtractDaysFromDate(10)
  },
  {
    id: '524',
    userId: '154',
    invoice: 'INV-876543',
    status: 'Active',
    totalAmount: 812.40,
    amountDue: 345.67,
    shopRate: 60,
    dueDate: addOrSubtractDaysFromDate(10)
  },
  {
    id: '525',
    userId: '155',
    invoice: 'INV-192837',
    status: 'Block',
    totalAmount: 970.25,
    amountDue: 210.98,
    shopRate: 50,
    dueDate: addOrSubtractDaysFromDate(10)
  },
  {
    id: '526',
    userId: '156',
    invoice: 'INV-283746',
    status: 'Block',
    totalAmount: 524.80,
    amountDue: 432.10,
    shopRate: 80,
    dueDate: addOrSubtractDaysFromDate(10)
  },
  {
    id: '527',
    userId: '157',
    invoice: 'INV-465728',
    status: 'Active',
    totalAmount: 789.90,
    amountDue: 187.65,
    shopRate: 60,
    dueDate: addOrSubtractDaysFromDate(10)
  },
  {
    id: '528',
    userId: '158',
    invoice: 'INV-372819',
    status: 'Active',
    totalAmount: 632.55,
    amountDue: 321.09,
    shopRate: 80,
    dueDate: addOrSubtractDaysFromDate(10)
  },
  {
    id: '529',
    userId: '159',
    invoice: 'INV-948576',
    status: 'Block',
    totalAmount: 915.30,
    amountDue: 543.21,
    shopRate: 30,
    dueDate: addOrSubtractDaysFromDate(10)
  },
  {
    id: '530',
    userId: '160',
    invoice: 'INV-562738',
    status: 'Active',
    totalAmount: 750.75,
    amountDue: 321.09,
    shopRate: 70,
    dueDate: addOrSubtractDaysFromDate(10)
  },
]

export const sellersData: SellersType[] = [
  {
    id: '2001',
    title: 'Lacoste',
    image: sellers1,
    rating: {
      star: 4.5,
      review: 5.3
    },
    description: 'Lacoste, a global icon in the world of fashion, was founded in 1933 by the legendary French tennis player René Lacoste.',
    location: '966 Hiddenview Drive Philadelphia,',
    email: 'lacostefashion@rhyta.com',
    stock: '941',
    sells: 6.7,
    brand: 'Fashion',
    revenue: '62,100',
    series: [{ data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54] }],
  },
  {
    id: '2002',
    title: 'Asics Foot Ware',
    image: sellers4,
    rating: {
      star: 4.5,
      review: 2.5
    },
    description: ' Asics footwear is renowned for its advanced technology and superior craftsmanship, making it a favorite among athletes and fitness worldwide.',
    location: '2267 Raver Croft Drive Chattanooga,',
    email: 'asionwares@rhyta.com',
    stock: '764',
    sells: 2.9,
    brand: 'Footware',
    revenue: '40,400',
    series: [{ data: [17, 83, 56, 45, 29, 92, 38, 72, 11, 67, 53] }],
  },
  {
    id: '2003',
    title: 'American Tourister',
    image: sellers6,
    rating: {
      star: 4.5,
      review: 4.9
    },
    description: 'American Tourister, a trusted name in the luggage industry, has been synonymous with quality, durability, and style since its founding in 1933.',
    location: '3383 Briarhill Lane Youngstown,',
    email: 'americanbag@rhyta.com',
    stock: '1.6k',
    sells: 5.1,
    brand: 'Luggage',
    revenue: '75,450',
    series: [{ data: [34, 77, 23, 65, 48, 90, 14, 69, 37, 52, 81] }]
  },
  {
    id: '2004',
    title: 'Hitachi',
    image: sellers7,
    rating: {
      star: 4.5,
      review: 8
    },
    description: 'Hitachi, Ltd., founded in 1910, is a global leader in technology and innovation, renowned for its diverse range of products and services.',
    location: '2496 Gladwell Street Cleburne,',
    email: 'hitachielectronics@rhyta.com',
    stock: '3.1k',
    sells: 15.9,
    brand: 'Electronics',
    revenue: '98,900',
    series: [{ data: [45, 12, 78, 31, 56, 89, 22, 67, 41, 53, 96] }],
  },
  {
    id: '2005',
    title: 'Pepperfry',
    image: sellers8,
    rating: {
      star: 4.5,
      review: 6.9
    },
    description: "Pepperfry, launched in 2012, has rapidly grown to become India's leading online marketplace for furniture and home decor. ",
    location: '3840 Sunset Drive Brinkley,',
    email: 'pepperfryfurniture@rhyta.com',
    stock: '2.9k',
    sells: 7.5,
    brand: 'Furniture',
    revenue: '54,810',
    series: [{ data: [72, 35, 87, 23, 56, 94, 11, 68, 49, 75, 31] }],
  },
  {
    id: '2006',
    title: 'Skulcandy',
    image: sellers2,
    rating: {
      star: 4.5,
      review: 7.5
    },
    description: "Skullcandy, founded in 2003 by Rick Alden, is a leading audio brand known for its innovative and stylish audio accessories.",
    location: '1024 Veltri Drive Takotna,',
    email: 'skulcandyaudio@rhyta.com',
    stock: '4.8k',
    sells: 10.3,
    brand: 'Audio',
    revenue: '63,219',
    series: [{ data: [18, 47, 32, 76, 51, 22, 65, 39, 58, 14, 83] }],
  },
]

export const invoicesData : InvoicesType[] =[
  {
    id: '451',
    userId: '151',
    productId: '1',
    amount: '42,430',
    date: addOrSubtractDaysFromDate(15),
    invoicesStatus: 'Paid'
  },
  {
    id: '452',
    userId: '152',
    productId: '2',
    amount: '416',
    date: addOrSubtractDaysFromDate(25),
    invoicesStatus: 'Pending'
  },
  {
    id: '453',
    userId: '153',
    productId: '3',
    amount: '187',
    date: addOrSubtractDaysFromDate(320),
    invoicesStatus: 'Paid'
  },
  {
    id: '454',
    userId: '154',
    productId: '4',
    amount: '165',
    date: addOrSubtractDaysFromDate(48),
    invoicesStatus: 'Paid'
  },
  {
    id: '455',
    userId: '155',
    productId: '5',
    amount: '165',
    date: addOrSubtractDaysFromDate(198),
    invoicesStatus: 'Cancelled'
  },
  {
    id: '456',
    userId: '156',
    productId: '6',
    amount: '192',
    date: addOrSubtractDaysFromDate(56),
    invoicesStatus: 'Pending'
  },
  {
    id: '457',
    userId: '157',
    productId: '7',
    amount: '159',
    date: addOrSubtractDaysFromDate(654),
    invoicesStatus: 'Paid'
  },
  {
    id: '458',
    userId: '158',
    productId: '8',
    amount: '259',
    date: addOrSubtractDaysFromDate(45),
    invoicesStatus: 'Cancelled'
  },
  {
    id: '459',
    userId: '159',
    productId: '9',
    amount: '259',
    date: addOrSubtractDaysFromDate(74),
    invoicesStatus: 'Paid'
  },
  {
    id: '460',
    userId: '160',
    productId: '10',
    amount: '256',
    date: addOrSubtractDaysFromDate(654),
    invoicesStatus: 'Pending'
  },
]

export const dataTableRecords: Employee[] = [
  {
    id: '11',
    name: 'Jonathan',
    email: 'jonathan@example.com',
    position: 'Senior Implementation Architect',
    company: 'Hauck Inc',
    country: 'Holy See',
     office: 'Tokyo',
    age: 33,
    startDate: '2008/11/28',
    salary: `${currency}162,700`,
  },
  {
    id: '12',
    name: 'Harold',
    email: 'harold@example.com',
    position: 'Forward Creative Coordinator',
    company: 'Metz Inc',
    country: 'Iran',
    office: 'London',
    age: 47,
    startDate: '2009/10/09',
    salary: `${currency}1,200,000`,
  },
  {
    id: '13',
    name: 'Shannon',
    email: 'shannon@example.com',
    position: 'Legacy Functionality Associate',
    company: 'Zemlak Group',
    country: 'South Georgia',
    office: 'San Francisco',
    age: 66,
    startDate: '2009/01/12',
    salary: `${currency}86,000`,
  },
  {
    id: '14',
    name: 'Robert',
    email: 'robert@example.com',
    position: 'Product Accounts Technician',
    company: 'Hoeger',
    country: 'San Marino',
    office: 'London',
    age: 41,
    startDate: '2012/10/13',
    salary: `${currency}y132,000`,
  },
  {
    id: '15',
    name: 'Noel',
    email: 'noel@example.com',
    position: 'Customer Data Director',
    company: 'Howell - Rippin',
    country: 'Germany',
    office: 'San Francisco',
    age: 28,
    startDate: '2011/06/07',
    salary: `${currency}206,850`,
  },
  {
    id: '16',
    name: 'Traci',
    email: 'traci@example.com',
    position: 'Corporate Identity Director',
    company: 'Koelpin - Goldner',
    country: 'Vanuatu',
    office: 'New York',
    age: 61,
    startDate: '2012/12/02',
    salary: `${currency}372,000`,
  },
  {
    id: '17',
    name: 'Kerry',
    email: 'kerry@example.com',
    position: 'Lead Applications Associate',
    company: 'Feeney, Langworth and Tremblay',
    country: 'Niger',
    office: 'London',
    age: 38,
    startDate: '2011/05/03',
    salary: `${currency}163,500`,
  },
  {
    id: '18',
    name: 'Patsy',
    email: 'patsy@example.com',
    position: 'Dynamic Assurance Director',
    company: 'Streich Group',
    country: 'Niue',
    office: 'New York',
    age: 21,
    startDate: '2011/12/12',
    salary: `${currency}106,450`,
  },
  {
    id: '19',
    name: 'Cathy',
    email: 'cathy@example.com',
    position: 'Customer Data Director',
    company: 'Ebert, Schamberger and Johnston',
    country: 'Mexico',
    office: 'New York',
    age: 46,
    startDate: '2011/12/06',
    salary: `${currency}145,600`,
  },
  {
    id: '20',
    name: 'Tyrone',
    email: 'tyrone@example.com',
    position: 'Senior Response Liaison',
    company: 'Raynor, Rolfson and Daugherty',
    country: 'Qatar',
    office: 'Edinburgh',
    age: 22,
    startDate: '2012/03/29',
    salary: `${currency}433,060`,
  },
]