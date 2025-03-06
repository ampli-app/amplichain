
export interface Post {
  id: string;
  userId: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  timeAgo: string;
  content: string;
  createdAt: string;
  isPoll?: boolean;
  pollOptions?: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  userVoted?: string;
  userLiked?: boolean;
  likes: number;
  comments: number;
  hashtags?: string[];
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
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  userId: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  createdAt: string;
  timeAgo: string;
  likes: number;
  replies: number;
}

export interface Hashtag {
  id: string;
  name: string;
  postsCount: number;
}
