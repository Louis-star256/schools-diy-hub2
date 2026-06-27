
import type { FieldValue, Timestamp } from 'firebase/firestore';

export type School = {
  id: string;
  name: string;
  type: 'Primary Institution' | 'Secondary Institution' | 'Tertiary Institution';
  address: string;
  city?: string;
  district?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  contact: string;
  badgeUrl?: string;
  previewImageUrl?: string;
  email?: string;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  levelOfStudies?: string;
  bio: string;
  institutionType?: 'Individual' | 'Primary Institution' | 'Secondary Institution' | 'Tertiary Institution' | 'Organisation';
  followers?: number;
  schoolId?: string;
  homeAddress?: string;
  personalContacts?: string;
  interestInInnovation?: string;
  language?: string;
  homeCountry?: string;
  institutionRole?: 'Pupil' | 'Patron' | 'Head';
  ageBracket?: '6-9' | '10-12' | '13-15' | '16-18' | '18+';
  approved?: boolean;
  supervisorId?: string;
  interestAreas?: string[];
  sponsorshipType?: string;
  walletBalance?: number;
  totalGifts?: number;
  totalDonations?: number;
  pendingWithdrawals?: number;
  receivingAccount?: string;
  receivingMethod?: 'MTN' | 'Airtel' | 'Card';
};

export type Project = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  userId: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  materials: string[];
  instructions: string;
  likes: number;
  sponsors?: number;
  isSponsored?: boolean;
  videoUrl?: string;
  audioUrl?: string;
  liveLink?: string;
  totalFunding?: number;
  createdAt?: FieldValue | Timestamp;
  status?: 'pending' | 'verified' | 'featured' | 'published';
  communityImpact?: string;
  supportNeeds?: string;
  trustInfo?: string;
  targetAmount?: number;
  raisedAmount?: number;
  certificateId?: string;
  views?: number;
  commentsCount?: number;
  earnedAmount?: number;
};

export type Transaction = {
  id: string;
  senderId: string;
  receiverId: string;
  projectId: string;
  amount: number;
  currency: string;
  type: 'gift' | 'sponsorship' | 'creator_donation' | 'project_gift' | 'boost';
  status: 'pending' | 'completed' | 'failed';
  method: 'MTN' | 'Airtel' | 'Card';
  createdAt: FieldValue | Timestamp;
  providerRef?: string;
};

export type Sponsorship = {
  id: string;
  sponsorId: string;
  projectId: string;
  type: 'Funding' | 'Mentorship' | 'Partnership';
  status: 'pending' | 'active' | 'completed';
  amount?: number;
  message?: string;
  createdAt: FieldValue | Timestamp;
};

export type Material = {
  name: string;
  description: string;
  sources: string[];
  imageUrl: string;
  imageHint: string;
};

export type ChatRoom = {
    id: string;
    name: string;
    description: string;
    userIds: string[];
    createdAt?: FieldValue;
    type: 'public' | 'private';
    typing?: Record<string, boolean>;
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: FieldValue;
    };
}

export type ChatMessage = {
    id: string;
    senderId: string;
    receiverId: string;
    message: string;
    timestamp: any;
    type: 'text' | 'image' | 'video' | 'audio';
    readBy?: string[];
}

export type UserStatus = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  mediaUrl: string;
  type: 'image' | 'text';
  text?: string;
  createdAt: Timestamp;
}

export type Advert = {
    id: string;
    title: string;
    content: string;
    targetAudience: 'all' | 'school' | 'institutionType';
    targetId?: string;
    createdAt: Timestamp;
    expiryDate?: Timestamp | null;
}

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  text: string;
  createdAt: FieldValue | Timestamp;
};

export type InnovationSession = {
  id: string;
  userId: string;
  title: string;
  createdAt: FieldValue | Timestamp;
  updatedAt: FieldValue | Timestamp;
};
