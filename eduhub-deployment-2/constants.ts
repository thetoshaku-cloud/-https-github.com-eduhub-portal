
import { Institution, InstitutionType } from './types';

// Helper to get logo from domain
const getLogo = (domain: string) => `https://logo.clearbit.com/${domain}?size=200`;

export const GENDERS = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];

export const ETHNICITIES = ['Black African', 'Coloured', 'Indian/Asian', 'White', 'Other'];

export const MATRIC_SUBJECTS = [
  'Accounting',
  'Agricultural Management Practices',
  'Agricultural Sciences',
  'Agricultural Technology',
  'Business Studies',
  'Civil Technology',
  'Computer Applications Technology',
  'Consumer Studies',
  'Dance Studies',
  'Design',
  'Dramatic Arts',
  'Economics',
  'Electrical Technology',
  'Engineering Graphics and Design',
  'English Home Language',
  'English First Additional Language',
  'Geography',
  'History',
  'Hospitality Studies',
  'Information Technology',
  'IsiNdebele',
  'IsiXhosa',
  'IsiZulu',
  'Life Orientation',
  'Life Sciences',
  'Mathematical Literacy',
  'Mathematics',
  'Mechanical Technology',
  'Music',
  'Physical Sciences',
  'Religion Studies',
  'Sepedi',
  'Sesotho',
  'Setswana',
  'Siswati',
  'Technical Mathematics',
  'Technical Sciences',
  'Tourism',
  'Tshivenda',
  'Visual Arts',
  'Xitsonga'
];

export const INSTITUTIONS: Institution[] = [
  {
    id: 'uct',
    name: 'University of Cape Town',
    type: InstitutionType.UNIVERSITY,
    location: 'Western Cape',
    description: 'South Africa\'s oldest university, renowned for research and academic excellence.',
    courses: [
      { name: 'BSc Computer Science', prerequisites: ['Mathematics > 70%', 'Physical Sciences > 60%'] },
      { name: 'MBChB Medicine', prerequisites: ['Mathematics > 80%', 'Physical Sciences > 70%', 'Life Sciences > 70%'] },
      { name: 'BCom Accounting', prerequisites: ['Mathematics > 60%', 'English > 60%'] },
      { name: 'LLB Law', prerequisites: ['English > 70%', 'NBT Score > Proficient'] }
    ],
    logoPlaceholder: getLogo('uct.ac.za'),
    contact: {
      phone: '+27 21 650 9111',
      email: 'admissions@uct.ac.za',
      website: 'www.uct.ac.za'
    }
  },
  {
    id: 'wits',
    name: 'University of the Witwatersrand',
    type: InstitutionType.UNIVERSITY,
    location: 'Gauteng',
    description: 'A multi-campus South African public research university situated in the northern areas of central Johannesburg.',
    courses: [
      { name: 'BSc Engineering', prerequisites: ['Mathematics > 70%', 'Physical Sciences > 70%'] },
      { name: 'BA Arts', prerequisites: ['English > 60%'] },
      { name: 'BSc Actuarial Science', prerequisites: ['Mathematics > 80%'] },
      { name: 'Bachelor of Architecture', prerequisites: ['Mathematics > 50%', 'Portfolio Submission'] }
    ],
    logoPlaceholder: getLogo('wits.ac.za'),
    contact: {
      phone: '+27 11 717 1000',
      email: 'study@wits.ac.za',
      website: 'www.wits.ac.za'
    }
  },
  {
    id: 'uj',
    name: 'University of Johannesburg',
    type: InstitutionType.UNIVERSITY,
    location: 'Gauteng',
    description: 'A vibrant, multicultural and dynamic comprehensive university.',
    courses: [
      { name: 'BTech Transport Management', prerequisites: ['Mathematical Literacy > 50%'] },
      { name: 'BCom Finance', prerequisites: ['Mathematics > 60%'] },
      { name: 'BA Design', prerequisites: ['English > 50%', 'Portfolio'] },
      { name: 'BSc IT', prerequisites: ['Mathematics > 60%'] }
    ],
    logoPlaceholder: getLogo('uj.ac.za'),
    contact: {
      phone: '+27 11 559 4555',
      email: 'mylife@uj.ac.za',
      website: 'www.uj.ac.za'
    }
  },
  {
    id: 'tut',
    name: 'Tshwane University of Technology',
    type: InstitutionType.TECHNICAL_UNIVERSITY,
    location: 'Gauteng',
    description: 'The largest residential higher education institution in South Africa.',
    courses: [
      { name: 'Diploma in IT', prerequisites: ['Mathematics > 40% or Mathematical Literacy > 60%'] },
      { name: 'BTech Nursing', prerequisites: ['Life Sciences > 50%', 'English > 50%'] },
      { name: 'National Diploma in Engineering', prerequisites: ['Mathematics > 50%', 'Physical Sciences > 50%'] }
    ],
    logoPlaceholder: getLogo('tut.ac.za'),
    contact: {
      phone: '+27 86 110 2421',
      email: 'general@tut.ac.za',
      website: 'www.tut.ac.za'
    }
  },
  {
    id: 'majuba',
    name: 'Majuba TVET College',
    type: InstitutionType.TVET,
    location: 'KwaZulu-Natal',
    description: 'Empowering students with vocational skills for the modern economy.',
    courses: [
      { name: 'NCV Engineering', prerequisites: ['Grade 9 Pass'] },
      { name: 'NATED Business Management', prerequisites: ['Grade 12 Pass'] },
      { name: 'Hospitality', prerequisites: ['Grade 10 Pass'] }
    ],
    logoPlaceholder: getLogo('majuba.edu.za'),
    contact: {
      phone: '+27 34 326 4888',
      email: 'info@majuba.edu.za',
      website: 'www.majuba.edu.za'
    }
  },
  {
    id: 'up',
    name: 'University of Pretoria',
    type: InstitutionType.UNIVERSITY,
    location: 'Gauteng',
    description: 'One of Africa’s top universities and the largest contact university in South Africa.',
    courses: [
      { name: 'BVSc Veterinary Science', prerequisites: ['Mathematics > 70%', 'Physical Sciences > 60%'] },
      { name: 'BEng Civil', prerequisites: ['Mathematics > 70%', 'Physical Sciences > 70%'] },
      { name: 'BCom Economics', prerequisites: ['Mathematics > 60%'] }
    ],
    logoPlaceholder: getLogo('up.ac.za'),
    contact: {
      phone: '+27 12 420 3111',
      email: 'ssc@up.ac.za',
      website: 'www.up.ac.za'
    }
  },
  {
    id: 'cput',
    name: 'Cape Peninsula University of Technology',
    type: InstitutionType.TECHNICAL_UNIVERSITY,
    location: 'Western Cape',
    description: 'The only university of technology in the Western Cape.',
    courses: [
      { name: 'Diploma in Maritime Studies', prerequisites: ['Mathematics > 50%', 'Physical Sciences > 50%'] },
      { name: 'BTech Radiography', prerequisites: ['Mathematics > 50%', 'Life Sciences > 60%'] },
      { name: 'Diploma in Agriculture', prerequisites: ['Life Sciences > 50%'] }
    ],
    logoPlaceholder: getLogo('cput.ac.za'),
    contact: {
      phone: '+27 21 959 6767',
      email: 'info@cput.ac.za',
      website: 'www.cput.ac.za'
    }
  }
];

export const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];