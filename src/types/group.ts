
export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
}

export interface GroupMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  postId: string;
  createdAt: string;
}

export interface GroupFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  postId: string;
  createdAt: string;
}

export interface GroupPost {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  timeAgo: string;
  media?: Array<{
    url: string;
    type: 'image' | 'video';
  }>;
  files?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  likes: number;
  comments: number;
  isPoll?: boolean;
  pollOptions?: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  userVoted?: string;
  userLiked?: boolean;
  hashtags?: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  profileImage?: string;
  memberCount: number;
  category: string;
  isPrivate: boolean;
  isMember: boolean;
  isAdmin: boolean;
  createdAt: string;
  posts: GroupPost[];
  members: GroupMember[];
  media: GroupMedia[];
  files: GroupFile[];
}
