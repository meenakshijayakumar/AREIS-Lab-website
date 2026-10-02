import { researchContent } from './research-content'

const baseAreas = [
  {
    title: 'Wearable robotics',
    fullTitle: 'Wearable Robotics and Human Augmentation',
    text: 'Supernumerary robotic fingers and arms, wearable haptics, and compliant wearable systems extend human capabilities and support research into assistance and rehabilitation.',
    details: 'The map brings together extra-limb prototypes, sensory feedback, grasp assistance, and everyday task experiments.',
    image: '/images/research/wearable-map.png',
    alt: 'Wearable robotics research map showing extra fingers and arms, haptic interfaces, grasp assistance, and task evaluations.',
  },
  {
    title: 'Compliant robotics',
    fullTitle: 'Variable Stiffness Actuation and Compliant Robotics',
    text: 'Variable-stiffness joints and compliant mechanisms explore how robots can adapt their physical response during contact and human interaction.',
    details: 'Featured systems include an adjustable joint mechanism, compliant robotic digits, an assistive arm, wearable joints, and walking and grasping evaluations.',
    image: '/images/research/compliant-map.png',
    alt: 'Compliant robotics research map showing a joint mechanism, robotic digits, an assistive arm, wearable joints, and interaction experiments.',
  },
  {
    title: 'Healthcare robotics',
    fullTitle: 'Healthcare Robotics',
    text: 'Wearable robots and assistive interfaces bring together mechanical design, sensing, and human interaction for rehabilitation research and everyday assistance.',
    details: 'The experiments shown cover knee exoskeletons, gait evaluation, wearable sensory feedback, assisted grasping, and object handling.',
    image: '/images/research/healthcare-map.png',
    alt: 'Healthcare robotics research map showing knee exoskeletons, gait evaluation, sensory feedback, and assisted everyday tasks.',
  },
  {
    title: 'Marine robotics',
    fullTitle: 'Marine Robotics and Autonomous Maritime Systems',
    text: 'Surface, aerial, and underwater robotic platforms support research into maritime navigation, inspection, manipulation, and environmental monitoring.',
    details: 'The map includes cooperative aerial and surface systems, marine prototypes, ROV preparation, pool testing, suction gripping, and coral colour assessment.',
    image: '/images/research/marine-map.png',
    alt: 'Marine robotics research map showing surface and aerial platforms, an underwater prototype, pool tests, a suction gripper, and coral colour reference imagery.',
  },
  {
    title: 'Agriculture',
    fullTitle: 'Agricultural Robotics and Intelligent Farming',
    text: 'Sensing, manipulation, and AI support fruit assessment, assisted pollination, crop inspection, harvesting, and postharvest handling.',
    details: 'Four startup initiatives: TouchRIPE for fruit firmness sensing; PollenMATIC for assisted pollination; Plant-AI for plant health inspection; and AerialYield for crop imagery analysis and yield estimation.',
    projects: 'Further projects include SortRIPE, OmniRIPE, HumaRipe, TeleRIPE, and PackRIPE, with work on laser weeding and PhenoAgent.',
    image: '/images/research/agriculture-map.png',
    alt: 'Agriculture research map featuring TouchRIPE, PollenMATIC, Plant-AI, AerialYield, and fruit grading, sensing, harvesting, and handling projects.',
  },
]

export const researchAreas = baseAreas.map((area, index) => ({ ...area, ...researchContent[index] }))

export type ResearchArea = (typeof researchAreas)[number]
