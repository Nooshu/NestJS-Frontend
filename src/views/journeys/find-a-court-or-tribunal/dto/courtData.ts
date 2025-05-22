export interface Court {
  id: string;
  name: string;
  address: {
    lines: string[];
    mapUrl: string;
  };
  openingTimes: {
    key: { text: string };
    value: { text: string };
  }[];
  emails: {
    key: { text: string };
    value: { text: string; html?: string };
  }[];
  telephones: {
    key: { text: string };
    value: { text: string };
  }[];
  facilities: {
    key: { text: string };
    value: { text: string; html?: string };
  }[];
  image: {
    url: string;
    alt: string;
  };
  handles: {
    text: string;
    href?: string;
  }[];
  codes: {
    crown: string;
    dx: string;
  };
}

export const courtsData: Record<string, Court> = {
  'manchester-crown': {
    id: 'manchester-crown',
    name: 'Manchester Crown Court (Minshull St)',
    address: {
      lines: ['The Court House', 'Aytoun Street', 'Manchester', 'M1 3FS'],
      mapUrl: 'https://www.google.com/maps?q=53.4809021085643,-2.25267283736438',
    },
    openingTimes: [
      {
        key: { text: 'Court open' },
        value: { text: 'Monday to Friday 7:30am to 5pm' },
      },
      {
        key: { text: 'Counter open' },
        value: { text: 'Monday to Friday 9am to 5pm' },
      },
      {
        key: { text: 'Telephone enquiries answered' },
        value: { text: 'Monday to Friday 8am to 5pm' },
      },
    ],
    emails: [
      {
        key: { text: 'Enquiries' },
        value: {
          text: 'Accommodation.manchesterminshullstreet.crowncourt@justice.gov.uk\n(Accommodation)',
          html: '<a class="govuk-link" href="mailto:Accommodation.manchesterminshullstreet.crowncourt@justice.gov.uk">Accommodation.manchesterminshullstreet.crowncourt@justice.gov.uk</a> (Accommodation)',
        },
      },
      {
        key: { text: 'Enquiries' },
        value: {
          text: 'courtclerks.manchesterminshullstreet.crowncourt@justice.gov.uk\n(Court Clerks)',
          html: '<a class="govuk-link" href="mailto:courtclerks.manchesterminshullstreet.crowncourt@justice.gov.uk">courtclerks.manchesterminshullstreet.crowncourt@justice.gov.uk</a> (Court Clerks)',
        },
      },
      {
        key: { text: 'Crown court' },
        value: {
          text: 'crownoffice.manchesterminshullstreet.crowncourt@justice.gov.uk',
          html: '<a class="govuk-link" href="mailto:crownoffice.manchesterminshullstreet.crowncourt@justice.gov.uk">crownoffice.manchesterminshullstreet.crowncourt@justice.gov.uk</a>',
        },
      },
      {
        key: { text: 'Listings' },
        value: {
          text: 'listing.manchesterminshullstreet.crowncourt@justice.gov.uk',
          html: '<a class="govuk-link" href="mailto:listing.manchesterminshullstreet.crowncourt@justice.gov.uk">listing.manchesterminshullstreet.crowncourt@justice.gov.uk</a>',
        },
      },
    ],
    telephones: [
      {
        key: { text: 'Enquiries' },
        value: { text: '0161 954 7500' },
      },
      {
        key: { text: 'Witness service' },
        value: { text: '0300 332 1000' },
      },
    ],
    facilities: [
      {
        key: { text: 'No parking' },
        value: {
          text: 'There are no parking facilities at this building, however public car parks are available nearby on Major Street, Bloom Street and Aurburn Street.',
        },
      },
      {
        key: { text: 'Disabled access' },
        value: {
          text: 'This is a grade 2* listed building and therefore access may be restricted...', // Plain text version
          html: 'This is a grade 2* listed building and therefore access may be restricted, There is no access for wheelchair users to courtrooms 5, 6, 7 & 8. Access is restricted to the well of the Court for wheelchair users in courtrooms 1, 2, 3, 4, 9 & 10. Please contact us to discuss this on <a class="govuk-link" href="mailto:Accommodation.manchesterminshullstreet.crowncourt@justice.gov.uk">Accommodation.manchesterminshullstreet.crowncourt@justice.gov.uk</a> or on 0161 954 7545. We do have a lift at the entrance and level access to most areas and some Courtrooms. We also have a lift to the first and second floors.',
        },
      },
      {
        key: { text: 'Hidden Disabilities Sunflower network' },
        value: {
          text: 'Lanyards available on request.',
        },
      },
      {
        key: { text: 'Assistance dogs' },
        value: {
          text: 'Assistance dogs are welcome.',
        },
      },
      {
        key: { text: 'Hearing Loop' },
        value: {
          text: 'The building has hearing enhancement facilities available in all courtroom',
        },
      },
      {
        key: { text: 'Security arch' },
        value: {
          text: 'For safety and security all users and their possessions will be searched by security when they enter this building. This court has a security arch. Please alert a security officer if you have a pacemaker.',
        },
      },
      {
        key: { text: 'Lift' },
        value: {
          text: 'Lifts are available in this building to access the first and second floors. For those requiring wheelchair access, the width of the doors is 32 inches and the weight restriction is 630kg.',
        },
      },
      {
        key: { text: 'Public toilets' },
        value: {
          text: 'Public toilets are available on the ground floor.',
        },
      },
      {
        key: { text: 'Disabled toilet' },
        value: {
          text: 'An accessible toilet is available on the ground floor.',
        },
      },
      {
        key: { text: 'Refreshments' },
        value: {
          text: 'Chilled water is available on the first floor.',
        },
      },
      {
        key: { text: 'Interview room' },
        value: {
          text: '	There are eleven interview/consultation rooms available in the building, located on the ground, first and second floors. It may be possible to book some of these in advance. Please contact us on 0161 954 7577.',
        },
      },
      {
        key: { text: 'Waiting Room' },
        value: {
          text: 'This building has a public waiting area outside courtrooms on the ground floor, first floor and second floor. There is a seperate waiting area for witnesses. Please ask for details.',
        },
      },
      {
        key: { text: 'Baby changing facility' },
        value: {
          text: 'Baby changing facilities are located in the disabled toilet on the ground floor.',
        },
      },
      {
        key: { text: 'Video facilities' },
        value: {
          text: 'Court/hearing room video conferencing facilities and prison to court video link facilities are available (by prior arrangement). For queries please contact listing.manchesterminshullstreet.crowncourt@justice.gov.uk or 0161 954 7500.',
          html: 'Court/hearing room video conferencing facilities and prison to court video link facilities are available (by prior arrangement). For queries please contact <a class="govuk-link" href="mailto:listing.manchesterminshullstreet.crowncourt@justice.gov.uk">listing.manchesterminshullstreet.crowncourt@justice.gov.uk</a> or 0161 954 7500.',
        },
      },
      {
        key: { text: 'Wireless network connection' },
        value: {
          text: 'Wi-Fi is available in all areas of the building and can be accessed via PCU or GOV Wi-Fi.',
        },
      },
    ],
    image: {
      url: '/assets/images/courtImages/manchesterCrownCourt.jpg',
      alt: 'Manchester Crown Court (Minshull St) exterior',
    },
    handles: [
      {
        text: 'Crime',
      },
      {
        text: 'Domestic Abuse Protection Order (DAPOs)',
        href: 'https://www.gov.uk/guidance/domestic-abuse-protection-notices-dapns-and-domestic-abuse-protection-orders-dapos',
      },
      {
        text: 'Single justice procedure',
      },
    ],
    codes: {
      crown: '436',
      dx: '724860 Manchester 43',
    },
  },
  'birmingham-crown': {
    id: 'birmingham-crown',
    name: 'Birmingham Crown Court',
    address: {
      lines: ['Queen Elizabeth II Law Courts', '1 Newton Street', 'Birmingham', 'B4 7NA'],
      mapUrl: 'https://maps.google.com/maps?q=52.482795,-1.8925',
    },
    openingTimes: [
      {
        key: { text: 'Court open' },
        value: { text: '9am to 5pm' },
      },
      {
        key: { text: 'Counter open' },
        value: { text: '9am to 5pm' },
      },
    ],
    emails: [
      {
        key: { text: 'Enquiries' },
        value: {
          text: 'enquiries.birmingham.crowncourt@justice.gov.uk',
          html: '<a class="govuk-link" href="mailto:enquiries.birmingham.crowncourt@justice.gov.uk">enquiries.birmingham.crowncourt@justice.gov.uk</a>',
        },
      },
    ],
    telephones: [
      {
        key: { text: 'Enquiries' },
        value: { text: '0121 681 3300' },
      },
      {
        key: { text: 'Witness service' },
        value: { text: '0300 332 1000' },
      },
    ],
    facilities: [
      {
        key: { text: 'Hidden Disabilities Sunflower network' },
        value: { text: 'Lanyards available on request.' },
      },
      {
        key: { text: 'Assistance dogs' },
        value: { text: 'Assistance dogs are welcome.' },
      },
      {
        key: { text: 'Hearing Loop' },
        value: {
          text: 'Hearing facilities are fixed in some Courtrooms and mobile units available for use in others.',
        },
      },
      {
        key: { text: 'Refreshments' },
        value: {
          text: 'Catering facilities are currently closed so there are no refreshments available on site',
        },
      },
      {
        key: { text: 'Interview room' },
        value: { text: 'Fifteen interview rooms are available at this court.' },
      },
      {
        key: { text: 'Wireless network connection' },
        value: { text: 'Access to GovWifi available.' },
      },
    ],
    image: {
      url: '/assets/images/courtImages/birminghamCrownCourt.jpg',
      alt: 'Birmingham Crown Court exterior',
    },
    handles: [
      {
        text: 'Crime',
      },
      {
        text: 'Single justice procedure',
      },
    ],
    codes: {
      crown: '404',
      dx: '702033 Birmingham 8',
    },
  },
  'london-crown': {
    id: 'london-crown',
    name: 'Inner London Crown Court',
    address: {
      lines: ['Sessions House', 'Newington Causeway', 'London', 'SE1 6AZ'],
      mapUrl: 'https://maps.google.com/maps?q=51.4981827741503,-0.0965350924886508',
    },
    openingTimes: [
      {
        key: { text: 'Court open' },
        value: { text: 'Monday to Friday 8am to 5pm' },
      },
      {
        key: { text: 'Counter open' },
        value: { text: '9am to 5pm' },
      },
    ],
    emails: [
      {
        key: { text: 'Enquiries' },
        value: {
          text: 'innerlondoncrowncourt@justice.gov.uk',
          html: '<a class="govuk-link" href="mailto:innerlondoncrowncourt@justice.gov.uk">innerlondoncrowncourt@justice.gov.uk</a>',
        },
      },
      {
        key: { text: 'Citizens advice' },
        value: {
          text: 'innerlondon.cc@citizensadvice.org.uk',
          html: '<a class="govuk-link" href="mailto:innerlondon.cc@citizensadvice.org.uk">innerlondon.cc@citizensadvice.org.uk</a>',
        },
      },
    ],
    telephones: [
      {
        key: { text: 'Enquiries' },
        value: { text: '020 7234 3100' },
      },
      {
        key: { text: 'Fax' },
        value: { text: '0870 324 0226' },
      },
      {
        key: { text: 'Witness service' },
        value: { text: '030 0332 1232' },
      },
    ],
    facilities: [
      {
        key: { text: 'Disabled access' },
        value: { text: 'Disabled access and disabled toilet' },
      },
      {
        key: { text: 'Hidden Disabilities Sunflower network' },
        value: { text: 'Lanyards available on request.' },
      },
      {
        key: { text: 'Assistance dogs' },
        value: { text: 'Assistance dogs are welcome.' },
      },
      {
        key: { text: 'Hearing Loop' },
        value: {
          text: 'This court has hearing enhancement facilities.  ',
        },
      },
      {
        key: { text: 'Refreshments' },
        value: {
          text: 'Vending machines are available at this court.',
        },
      },
      {
        key: { text: 'Interview room' },
        value: { text: 'Seven interview rooms are available at this court.' },
      },
      {
        key: { text: 'Prayer / Quiet room' },
        value: { text: 'This court has a prayer room.' },
      },
      {
        key: { text: 'Video facilities' },
        value: { text: 'Video conference and Prison Video Link facilities.' },
      },
      {
        key: { text: 'Wireless network connection' },
        value: { text: 'This court has wireless internet access available within the building.' },
      },
    ],
    image: {
      url: '/assets/images/courtImages/londonCrownCourt.jpg',
      alt: 'Inner London Crown Court exterior',
    },
    handles: [
      {
        text: 'Crime',
      },
      {
        text: 'Single justice procedure',
      },
    ],
    codes: {
      crown: '440',
      dx: 'DX: 97345 Southwark 3',
    },
  },
};
