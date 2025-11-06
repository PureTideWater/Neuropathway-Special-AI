/**
 * State Regulations Service
 * COMPETITIVE ADVANTAGE: State-specific compliance database
 * MagicSchool has ZERO compliance features - this is our moat
 *
 * Covers 10 states initially, expandable to all 50
 */

import { logger } from '../utils/logger';

export interface StateRegulation {
  state: string;
  stateName: string;
  lastUpdated: string;
  categories: RegulationCategory[];
  forms: RequiredForm[];
  timelines: Timeline[];
  specificRequirements: SpecificRequirement[];
}

export interface RegulationCategory {
  category: string;
  requirements: Requirement[];
}

export interface Requirement {
  code: string;
  title: string;
  description: string;
  mandatory: boolean;
  applicableAge?: string;
  url?: string;
}

export interface RequiredForm {
  name: string;
  required: boolean;
  timing: string;
  url?: string;
}

export interface Timeline {
  event: string;
  timeline: string;
}

export interface SpecificRequirement {
  area: string;
  requirement: string;
  notes?: string;
}

/**
 * Get regulations for a specific state
 */
export function getStateRegulations(stateCode: string): StateRegulation | null {
  const regulations: { [key: string]: StateRegulation } = {
    CA: getCaliforniaRegulations(),
    TX: getTexasRegulations(),
    FL: getFloridaRegulations(),
    NY: getNewYorkRegulations(),
    PA: getPennsylvaniaRegulations(),
    IL: getIllinoisRegulations(),
    OH: getOhioRegulations(),
    GA: getGeorgiaRegulations(),
    NC: getNorthCarolinaRegulations(),
    MI: getMichiganRegulations(),
  };

  return regulations[stateCode.toUpperCase()] || null;
}

/**
 * Get list of all supported states
 */
export function getSupportedStates(): Array<{ code: string; name: string }> {
  return [
    { code: 'CA', name: 'California' },
    { code: 'TX', name: 'Texas' },
    { code: 'FL', name: 'Florida' },
    { code: 'NY', name: 'New York' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'IL', name: 'Illinois' },
    { code: 'OH', name: 'Ohio' },
    { code: 'GA', name: 'Georgia' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'MI', name: 'Michigan' },
  ];
}

/**
 * California Regulations
 */
function getCaliforniaRegulations(): StateRegulation {
  return {
    state: 'CA',
    stateName: 'California',
    lastUpdated: '2024-01-15',
    categories: [
      {
        category: 'IEP Development',
        requirements: [
          {
            code: 'CA Ed Code 56341',
            title: 'IEP Team Composition',
            description:
              'Required team members must include parent, regular ed teacher, special ed teacher, LEA rep, assessment professional',
            mandatory: true,
            url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=56341',
          },
          {
            code: 'CA Ed Code 56345',
            title: 'IEP Content',
            description:
              'IEP must include present levels, goals, services, placement, and transition (age 16+)',
            mandatory: true,
          },
        ],
      },
      {
        category: 'Transition Services',
        requirements: [
          {
            code: 'CA Ed Code 56345.1',
            title: 'Transition Planning (Age 16+)',
            description: 'Must include post-secondary goals and transition services',
            mandatory: true,
            applicableAge: '16+',
          },
        ],
      },
    ],
    forms: [
      {
        name: 'IEP Meeting Notice',
        required: true,
        timing: '10 days before meeting (or as agreed)',
      },
      {
        name: 'Prior Written Notice (PWN)',
        required: true,
        timing: 'For any proposed/refused changes',
      },
    ],
    timelines: [
      {
        event: 'Initial IEP',
        timeline: 'Within 60 days of parental consent for assessment',
      },
      {
        event: 'Annual Review',
        timeline: 'At least once per year',
      },
    ],
    specificRequirements: [
      {
        area: 'Extended School Year (ESY)',
        requirement: 'Team must consider ESY annually',
        notes: 'CA Ed Code 56345',
      },
    ],
  };
}

/**
 * Texas Regulations
 */
function getTexasRegulations(): StateRegulation {
  return {
    state: 'TX',
    stateName: 'Texas',
    lastUpdated: '2024-02-01',
    categories: [
      {
        category: 'IEP Development',
        requirements: [
          {
            code: '19 TAC §89.1050',
            title: 'IEP Content Requirements',
            description: 'IEP must include present levels, annual goals, special education services, related services, supplementary aids',
            mandatory: true,
          },
          {
            code: '19 TAC §89.1055',
            title: 'ARD Committee',
            description: 'Admission, Review, and Dismissal (ARD) committee must include required members',
            mandatory: true,
          },
        ],
      },
      {
        category: 'Transition Services',
        requirements: [
          {
            code: '19 TAC §89.1055',
            title: 'Transition Planning',
            description: 'Transition planning required no later than age 14 (earlier than most states)',
            mandatory: true,
            applicableAge: '14+',
          },
        ],
      },
    ],
    forms: [
      {
        name: 'ARD Notice',
        required: true,
        timing: 'At least 5 school days before meeting',
      },
      {
        name: 'Prior Written Notice',
        required: true,
        timing: 'Within reasonable time after ARD decision',
      },
    ],
    timelines: [
      {
        event: 'Initial ARD Meeting',
        timeline: 'Within 30 calendar days of completion of evaluation',
      },
      {
        event: 'Annual Review',
        timeline: 'At least once every 12 months',
      },
    ],
    specificRequirements: [
      {
        area: 'Graduation',
        requirement: 'Consider graduation as part of transition planning for students 14+',
        notes: 'Texas requires earlier transition planning than federal law',
      },
    ],
  };
}

/**
 * Florida Regulations
 */
function getFloridaRegulations(): StateRegulation {
  return {
    state: 'FL',
    stateName: 'Florida',
    lastUpdated: '2024-01-20',
    categories: [
      {
        category: 'IEP Development',
        requirements: [
          {
            code: 'FL Rule 6A-6.03028',
            title: 'IEP Team and Content',
            description: 'IEP must include measurable annual goals, description of how progress will be measured',
            mandatory: true,
          },
        ],
      },
      {
        category: 'Transition Services',
        requirements: [
          {
            code: 'FL Rule 6A-6.03411',
            title: 'Transition Services',
            description: 'Must include appropriate measurable postsecondary goals',
            mandatory: true,
            applicableAge: '16+',
          },
        ],
      },
    ],
    forms: [
      {
        name: 'Notice of IEP Team Meeting',
        required: true,
        timing: '10 calendar days before meeting',
      },
    ],
    timelines: [
      {
        event: 'Initial IEP',
        timeline: 'Within 30 calendar days of eligibility determination',
      },
      {
        event: 'Annual Review',
        timeline: 'At least annually',
      },
    ],
    specificRequirements: [
      {
        area: 'Standard Diploma Options',
        requirement: 'Must consider standard diploma options for students with disabilities',
        notes: 'Florida has specific requirements around diploma options',
      },
    ],
  };
}

/**
 * New York Regulations
 */
function getNewYorkRegulations(): StateRegulation {
  return {
    state: 'NY',
    stateName: 'New York',
    lastUpdated: '2024-01-10',
    categories: [
      {
        category: 'IEP Development',
        requirements: [
          {
            code: '8 NYCRR §200.4',
            title: 'IEP Requirements',
            description: 'IEP must include present levels, measurable goals, special education services',
            mandatory: true,
          },
        ],
      },
      {
        category: 'Transition Services',
        requirements: [
          {
            code: '8 NYCRR §200.4(d)(2)',
            title: 'Transition Services',
            description: 'Coordinated set of activities beginning no later than first IEP in effect when student turns 15',
            mandatory: true,
            applicableAge: '15+',
          },
        ],
      },
    ],
    forms: [
      {
        name: 'Notice of Recommended IEP',
        required: true,
        timing: 'At least 5 days before implementation (if parent not at meeting)',
      },
    ],
    timelines: [
      {
        event: 'Initial IEP',
        timeline: 'Within 60 calendar days of parental consent',
      },
      {
        event: 'Annual Review',
        timeline: 'At least annually',
      },
    ],
    specificRequirements: [
      {
        area: 'Extended School Year',
        requirement: 'Must consider ESY services for students who demonstrate substantial regression',
      },
    ],
  };
}

/**
 * Pennsylvania Regulations
 */
function getPennsylvaniaRegulations(): StateRegulation {
  return {
    state: 'PA',
    stateName: 'Pennsylvania',
    lastUpdated: '2024-01-25',
    categories: [
      {
        category: 'IEP Development',
        requirements: [
          {
            code: '22 PA Code §14.131',
            title: 'IEP Content',
            description: 'IEP must include present levels, goals, program modifications, related services',
            mandatory: true,
          },
        ],
      },
      {
        category: 'Transition Services',
        requirements: [
          {
            code: '22 PA Code §14.131',
            title: 'Transition Planning',
            description: 'Transition services required beginning at age 14 or younger if appropriate',
            mandatory: true,
            applicableAge: '14+',
          },
        ],
      },
    ],
    forms: [
      {
        name: 'Notice of Recommended Educational Placement (NOREP)',
        required: true,
        timing: 'At least 10 calendar days before implementation',
      },
    ],
    timelines: [
      {
        event: 'Initial IEP',
        timeline: 'Within 60 calendar days of parental consent',
      },
      {
        event: 'Reevaluation',
        timeline: 'At least once every 2 years (PA is more frequent than federal 3 years)',
      },
    ],
    specificRequirements: [
      {
        area: 'Gifted IEPs',
        requirement: 'Pennsylvania also requires IEPs for gifted students',
        notes: 'Unique to PA - gifted students receive IEPs under state law',
      },
    ],
  };
}

/**
 * Illinois Regulations
 */
function getIllinoisRegulations(): StateRegulation {
  return {
    state: 'IL',
    stateName: 'Illinois',
    lastUpdated: '2024-02-05',
    categories: [
      {
        category: 'IEP Development',
        requirements: [
          {
            code: '23 IAC 226.230',
            title: 'IEP Content',
            description: 'IEP must include present levels, annual goals, special education and related services',
            mandatory: true,
          },
        ],
      },
    ],
    forms: [
      {
        name: 'Notice of IEP Conference',
        required: true,
        timing: 'At least 10 days before meeting',
      },
    ],
    timelines: [
      {
        event: 'Initial IEP',
        timeline: 'Within 30 school days of eligibility determination',
      },
      {
        event: 'Annual Review',
        timeline: 'At least annually',
      },
    ],
    specificRequirements: [
      {
        area: 'Progress Reports',
        requirement: 'Parents must receive progress reports at least as frequently as general education students',
      },
    ],
  };
}

/**
 * Ohio Regulations
 */
function getOhioRegulations(): StateRegulation {
  return {
    state: 'OH',
    stateName: 'Ohio',
    lastUpdated: '2024-01-30',
    categories: [
      {
        category: 'IEP Development',
        requirements: [
          {
            code: 'OAC 3301-51-07',
            title: 'IEP Requirements',
            description: 'IEP must include present levels, measurable annual goals, special education services',
            mandatory: true,
          },
        ],
      },
    ],
    forms: [
      {
        name: 'Prior Written Notice',
        required: true,
        timing: 'Reasonable time before proposed action',
      },
    ],
    timelines: [
      {
        event: 'Initial IEP',
        timeline: 'Within 30 days of eligibility determination',
      },
      {
        event: 'Annual Review',
        timeline: 'At least annually',
      },
    ],
    specificRequirements: [
      {
        area: 'Extended School Year',
        requirement: 'ESY consideration based on substantial regression/recoupment',
      },
    ],
  };
}

/**
 * Georgia Regulations
 */
function getGeorgiaRegulations(): StateRegulation {
  return {
    state: 'GA',
    stateName: 'Georgia',
    lastUpdated: '2024-02-10',
    categories: [
      {
        category: 'IEP Development',
        requirements: [
          {
            code: 'GA Rule 160-4-7-.07',
            title: 'IEP Content',
            description: 'IEP must include present levels, annual goals, services, accommodations',
            mandatory: true,
          },
        ],
      },
    ],
    forms: [
      {
        name: 'IEP Meeting Notice',
        required: true,
        timing: 'Reasonable notice before meeting',
      },
    ],
    timelines: [
      {
        event: 'Initial IEP',
        timeline: 'Within 30 calendar days of eligibility determination',
      },
      {
        event: 'Annual Review',
        timeline: 'At least annually',
      },
    ],
    specificRequirements: [
      {
        area: 'Least Restrictive Environment',
        requirement: 'LRE determination must be made annually',
      },
    ],
  };
}

/**
 * North Carolina Regulations
 */
function getNorthCarolinaRegulations(): StateRegulation {
  return {
    state: 'NC',
    stateName: 'North Carolina',
    lastUpdated: '2024-01-18',
    categories: [
      {
        category: 'IEP Development',
        requirements: [
          {
            code: 'NC Rule 1503-2.7',
            title: 'IEP Content',
            description: 'IEP must include present levels, annual goals, short-term objectives for some students',
            mandatory: true,
          },
        ],
      },
    ],
    forms: [
      {
        name: 'Prior Written Notice',
        required: true,
        timing: 'Reasonable time before or after action',
      },
    ],
    timelines: [
      {
        event: 'Initial IEP',
        timeline: 'Within 30 calendar days of eligibility determination',
      },
      {
        event: 'Annual Review',
        timeline: 'At least annually',
      },
    ],
    specificRequirements: [
      {
        area: 'Behavior Intervention Plan',
        requirement: 'BIP required when behavior impedes learning',
      },
    ],
  };
}

/**
 * Michigan Regulations
 */
function getMichiganRegulations(): StateRegulation {
  return {
    state: 'MI',
    stateName: 'Michigan',
    lastUpdated: '2024-02-01',
    categories: [
      {
        category: 'IEP Development',
        requirements: [
          {
            code: 'MARSE R 340.1721',
            title: 'IEP Requirements',
            description: 'IEP must include present levels, annual goals, special education services',
            mandatory: true,
          },
        ],
      },
    ],
    forms: [
      {
        name: 'Notice and Consent',
        required: true,
        timing: 'Reasonable notice before IEP meeting',
      },
    ],
    timelines: [
      {
        event: 'Initial IEP',
        timeline: 'Within 30 school days of eligibility determination',
      },
      {
        event: 'Annual Review',
        timeline: 'At least annually',
      },
    ],
    specificRequirements: [
      {
        area: 'Progress Reporting',
        requirement: 'Progress toward annual goals must be reported to parents regularly',
      },
    ],
  };
}

export default {
  getStateRegulations,
  getSupportedStates,
};
