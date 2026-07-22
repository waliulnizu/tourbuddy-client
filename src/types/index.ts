export interface User {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
  role?: 'admin' | 'traveler' | 'guide';
  status?: string;
  profilePicture?: string;
}

export interface Traveler {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  address?: string;
  status?: string;
  profilePicture?: string;
}

export interface Post {
  _id: string;
  title: string;
  amount: string;
  details: string;
  image?: string;
  place_from?: string;
  place_to?: string;
  date_from?: string;
  date_to?: string;
  contact?: string;
  gender?: string;
  members?: number;
  join_deadline?: number;
  status?: string;
  traveler?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
}

export interface Blog {
  _id: string;
  title: string;
  details: string;
  blog_image?: string;
  traveler?: {
    _id?: string;
    name?: string;
  };
  status?: string;
  createdAt: string;
}

export interface Slider {
  _id: string;
  slider_title: string;
  slider_slugan: string;
  slider_image?: string;
  status?: string;
}

export interface Banner {
  _id: string;
  title?: string;
  image?: string;
}

export interface BannerText {
  title?: string;
  details?: string;
}

export interface Guide {
  _id: string;
  name: string;
  email?: string;
  designation?: string;
  phone: string;
  address?: string;
  bio?: string;
  experience?: string;
  guide_image?: string;
  status?: string;
}

export interface AboutData {
  _id?: string;
  title?: string;
  des?: string;
  about_image?: string;
}

export interface ContactData {
  _id?: string;
  address?: string;
  city?: string;
  email?: string;
  telephone?: string;
  phone?: string;
  phone_2?: string;
}

export interface HomeData {
  posts: Post[];
  blogs: Blog[];
  sliders: Slider[];
  bannertext: BannerText | null;
  banners: Banner[];
  guides?: Guide[];
}

export interface AdminStats {
  totalPost: number;
  totalPendingPost: number;
  totalPendingGuide: number;
  totalTraveler: number;
}

export interface Connect {
  _id: string;
  post: string;
  traveler: {
    _id: string;
    name?: string;
    email?: string;
    profilePicture?: string;
  };
  status: 'pending' | 'active' | 'approved' | 'rejected';
  createdAt?: string;
}

export interface ChatMessage {
  _id: string;
  sender: { _id: string; name?: string; profilePicture?: string };
  receiver: { _id: string; name?: string; profilePicture?: string };
  post: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  user: { name?: string; profilePicture?: string };
  post?: { _id: string; title?: string } | null;
  lastMessage: { text: string; createdAt: string };
  unreadCount: number;
}

export interface PostFormData {
  title: string;
  amount: string;
  phone: string;
  gender: string;
  date_from: string;
  date_to: string;
  place_from: string;
  place_to: string;
  details: string;
  members: string;
  join_deadline: string;
}

export interface BlogFormData {
  title: string;
  details: string;
  blog_image?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface Message {
  type: 'success' | 'error';
  text: string;
}

export interface TravelerDetailResponse {
  traveler: Traveler;
  percentage?: number;
  star_total?: number;
}

export interface ProfileFormData {
  name: string;
  phone: string;
  gender: string;
  address: string;
  profilePicture?: string;
}

export interface PasswordChangeForm {
  password: string;
  confirmPassword: string;
}

export interface AboutFormData {
  title: string;
  des: string;
}

export interface BannerFormData {
  title: string;
  image: string;
}

export type PostFilter = 'all' | 'pending' | 'active';

export interface Application {
  _id: string;
  name: string;
  email: string;
  phone: string;
  cv?: string;
  status?: string;
}

export interface Notification {
  _id: string;
  user: string;
  fromUser: { _id: string; name?: string; profilePicture?: string };
  type: 'join_request' | 'message' | 'approved' | 'rejected';
  post: { _id: string; title?: string; image?: string };
  connect?: string;
  text: string;
  read: boolean;
  link: string;
  createdAt: string;
}
