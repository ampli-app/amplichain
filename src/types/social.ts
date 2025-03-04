
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
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: number;
  comments: number;
  saves: number;
  hasLiked?: boolean;
  hasSaved?: boolean;
  hashtags?: string[];
  mediaFiles?: Array<{url: string, type: 'image' | 'video'}>;
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
  hasLiked?: boolean;
}

export interface Hashtag {
  id: string;
  name: string;
  postsCount: number;
}
