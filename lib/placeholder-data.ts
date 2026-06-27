import type { User, Project, Material, School, ChatRoom } from './types';
import placeholderImagesData from './placeholder-images.json';

const { placeholderImages } = placeholderImagesData;

const getImage = (id: string) => {
  const img = placeholderImages.find(p => p.id === id);
  return {
    url: img?.imageUrl ?? 'https://picsum.photos/seed/error/400/300',
    hint: img?.imageHint ?? 'placeholder image'
  };
};

export const schools: School[] = [
    {
        id: 'school-1',
        name: 'Springfield High',
        type: 'Secondary Institution',
        address: '123 Education Lane, Kampala',
        contact: '+256 700 000000'
    }
];

export const demoUsers: User[] = [
  {
    id: 'demo-user-1',
    fullName: 'Hub Lead Innovator',
    email: 'innovator@diyhub.demo',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    levelOfStudies: 'Senior 2',
    bio: 'Lead member of School\'s DIY Hub. I love building robots and solving community problems with code.',
    institutionType: 'Secondary Institution',
    institutionRole: 'Pupil',
    schoolId: 'school-1',
    followers: 1250,
    homeCountry: 'Uganda',
    approved: true
  },
  {
    id: 'demo-user-2',
    fullName: 'Sarah Robotics',
    email: 'sarah@diyhub.demo',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    levelOfStudies: 'University Year 1',
    bio: 'Specializing in Arduino and IoT sensors for sustainable farming.',
    institutionType: 'Tertiary Institution',
    institutionRole: 'Pupil',
    followers: 450,
    homeCountry: 'Kenya',
    approved: true
  },
  {
    id: 'demo-user-3',
    fullName: 'Mike The Maker',
    email: 'mike@diyhub.demo',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Independent innovator building low-cost solar solutions for local markets.',
    institutionType: 'Individual',
    institutionRole: 'Patron',
    followers: 890,
    homeCountry: 'Nigeria',
    approved: true
  },
  {
    id: 'demo-user-4',
    fullName: 'High School Tech Club',
    email: 'techclub@diyhub.demo',
    profilePicture: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop',
    bio: 'A group of 15 students working on robotics and web apps.',
    institutionType: 'Organisation',
    institutionRole: 'Head',
    followers: 2100,
    homeCountry: 'Uganda',
    approved: true
  }
];

export const demoProjects: Project[] = [
  {
    id: 'demo-proj-1',
    title: 'Smart Solar Irrigator',
    description: 'A fully automated irrigation system powered by the sun. It detects soil moisture and waters plants only when needed.',
    imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&h=600&fit=crop',
    imageHint: 'solar farming',
    userId: 'demo-user-1',
    skillLevel: 'Advanced',
    materials: ['Arduino Uno', 'Solar Panel', 'Soil Moisture Sensor', 'Water Pump', 'Relay Module'],
    instructions: '1. Connect the solar panel to the battery shield. 2. Wire the soil moisture sensor to the analog pin. 3. Code the logic to trigger the pump when moisture is below 30%.',
    likes: 450,
    sponsors: 12,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-close-up-1551-large.mp4'
  },
  {
    id: 'demo-proj-2',
    title: 'Voice Controlled Light',
    description: 'Control your room lights using simple voice commands. No internet required!',
    imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&h=600&fit=crop',
    imageHint: 'smart home',
    userId: 'demo-user-2',
    skillLevel: 'Intermediate',
    materials: ['ESP32', 'Relay', 'Microphone Module', 'LED Light'],
    instructions: '1. Setup the ESP32 with voice recognition library. 2. Define keywords like "Light On". 3. Connect relay to high voltage safely.',
    likes: 230,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-coding-on-a-laptop-screen-in-close-up-42240-large.mp4'
  },
  {
    id: 'demo-proj-3',
    title: 'Cardboard Hydraulic Arm',
    description: 'Learn the principles of hydraulics by building a functional robotic arm from household waste.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
    imageHint: 'mechanical engineering',
    userId: 'demo-user-1',
    skillLevel: 'Beginner',
    materials: ['Cardboard', 'Syringes', 'Plastic Tubing', 'Glue', 'Water'],
    instructions: '1. Cut cardboard into arm segments. 2. Connect syringes with tubes. 3. Fill with water to transfer pressure.',
    likes: 890,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-student-working-on-a-robot-in-a-lab-42224-large.mp4'
  }
];

export const demoChatRooms: ChatRoom[] = [
    {
        id: 'general',
        name: 'General Innovation Hub',
        description: 'The main room for all DIY creators to share ideas.',
        userIds: ['demo-user-1', 'demo-user-2', 'demo-user-3', 'demo-user-4'],
        type: 'public'
    },
    {
        id: 'robotics-lab',
        name: 'Robotics & AI',
        description: 'Focusing on Arduino, Raspberry Pi, and Automation.',
        userIds: ['demo-user-1', 'demo-user-2'],
        type: 'public'
    }
];

export const materials: Material[] = [
    {
        name: "Basic Electronics",
        description: "Components for building simple circuits and robots.",
        sources: ["Online electronics stores", "Local hobby shops"],
        imageUrl: getImage('material-1').url,
        imageHint: getImage('material-1').hint,
    },
    {
        name: "Crafting Supplies",
        description: "Essential items for artistic and model-making projects.",
        sources: ["Art supply stores", "Department stores", "Online retailers"],
        imageUrl: getImage('material-2').url,
        imageHint: getImage('material-2').hint,
    }
];
