import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Save, MessageCircle, PlusCircle, Filter, UserPlus, CheckCircle, UserCheck, Users, User, Globe, ChevronDown, Copy, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { CreatePostModal } from '@/components/CreatePostModal';
import { SocialFeedContent } from '@/components/social/SocialFeedContent';

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes: number;
  user_id: string;
  media_url: string | null;
  author: {
    avatar_url: string | null;
    full_name: string | null;
    id: string | null;
  };
  comments: number;
}

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  role: string;
  bio: string;
  website: string;
  location: string;
  created_at: string;
  updated_at: string;
  email: string;
}

const calculateTimeAgo = (createdAt: string): string => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sek. temu`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} min. temu`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} godz. temu`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} dni temu`;
  }
};

export default function Discovery() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isConnectionSent, setIsConnectionSent] = useState(false);
  const [isConnectionReceived, setIsConnectionReceived] = useState(false);
  const [isConnectionAccepted, setIsConnectionAccepted] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollower, setIsFollower] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isGovernment, setIsGovernment] = useState(false);
  const [isNonProfit, setIsNonProfit] = useState(false);
  const [isEducational, setIsEducational] = useState(false);
  const [isArtistic, setIsArtistic] = useState(false);
  const [isScientific, setIsScientific] = useState(false);
  const [isJournalistic, setIsJournalistic] = useState(false);
  const [isPolitical, setIsPolitical] = useState(false);
  const [isReligious, setIsReligious] = useState(false);
  const [isActivist, setIsActivist] = useState(false);
  const [isCommunity, setIsCommunity] = useState(false);
  const [isPersonal, setIsPersonal] = useState(false);
  const [isBrand, setIsBrand] = useState(false);
  const [isProduct, setIsProduct] = useState(false);
  const [isService, setIsService] = useState(false);
  const [isEvent, setIsEvent] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [isCause, setIsCause] = useState(false);
  const [isProject, setIsProject] = useState(false);
  const [isMovement, setIsMovement] = useState(false);
  const [isCampaign, setIsCampaign] = useState(false);
  const [isInitiative, setIsInitiative] = useState(false);
  const [isChallenge, setIsChallenge] = useState(false);
  const [isCompetition, setIsCompetition] = useState(false);
  const [isContest, setIsContest] = useState(false);
  const [isGiveaway, setIsGiveaway] = useState(false);
  const [isSweepstakes, setIsSweepstakes] = useState(false);
  const [isRaffle, setIsRaffle] = useState(false);
  const [isAuction, setIsAuction] = useState(false);
  const [isDonation, setIsDonation] = useState(false);
  const [isFundraiser, setIsFundraiser] = useState(false);
  const [isCrowdfunding, setIsCrowdfunding] = useState(false);
  const [isInvestment, setIsInvestment] = useState(false);
  const [isVenture, setIsVenture] = useState(false);
  const [isStartup, setIsStartup] = useState(false);
  const [isSmallBusiness, setIsSmallBusiness] = useState(false);
  const [isMediumBusiness, setIsMediumBusiness] = useState(false);
  const [isLargeBusiness, setIsLargeBusiness] = useState(false);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [isCorporation, setIsCorporation] = useState(false);
  const [isMultinational, setIsMultinational] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [isRegional, setIsRegional] = useState(false);
  const [isNational, setIsNational] = useState(false);
  const [isInternational, setIsInternational] = useState(false);
  const [isWorldwide, setIsWorldwide] = useState(false);
  const [isUniverse, setIsUniverse] = useState(false);
  const [isEarth, setIsEarth] = useState(false);
  const [isPlanet, setIsPlanet] = useState(false);
  const [isSolarSystem, setIsSolarSystem] = useState(false);
  const [isGalaxy, setIsGalaxy] = useState(false);
  const [isCluster, setIsCluster] = useState(false);
  const [isSupercluster, setIsSupercluster] = useState(false);
  const [isFilament, setIsFilament] = useState(false);
  const [isVoid, setIsVoid] = useState(false);
  const [isWall, setIsWall] = useState(false);
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFollowingProfile, setIsFollowingProfile] = useState(false);
  const [isConnectionSentProfile, setIsConnectionSentProfile] = useState(false);
  const [isConnectionReceivedProfile, setIsConnectionReceivedProfile] = useState(false);
  const [isConnectionAcceptedProfile, setIsConnectionAcceptedProfile] = useState(false);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
  const [isFollowerProfile, setIsFollowerProfile] = useState(false);
  const [isOnlineProfile, setIsOnlineProfile] = useState(false);
  const [isVerifiedProfile, setIsVerifiedProfile] = useState(false);
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);
  const [isBusinessProfile, setIsBusinessProfile] = useState(false);
  const [isCreatorProfile, setIsCreatorProfile] = useState(false);
  const [isInfluencerProfile, setIsInfluencerProfile] = useState(false);
  const [isPublicProfile, setIsPublicProfile] = useState(false);
  const [isGovernmentProfile, setIsGovernmentProfile] = useState(false);
  const [isNonProfitProfile, setIsNonProfitProfile] = useState(false);
  const [isEducationalProfile, setIsEducationalProfile] = useState(false);
  const [isArtisticProfile, setIsArtisticProfile] = useState(false);
  const [isScientificProfile, setIsScientificProfile] = useState(false);
  const [isJournalisticProfile, setIsJournalisticProfile] = useState(false);
  const [isPoliticalProfile, setIsPoliticalProfile] = useState(false);
  const [isReligiousProfile, setIsReligiousProfile] = useState(false);
  const [isActivistProfile, setIsActivistProfile] = useState(false);
  const [isCommunityProfile, setIsCommunityProfile] = useState(false);
  const [isPersonalProfile, setIsPersonalProfile] = useState(false);
  const [isBrandProfile, setIsBrandProfile] = useState(false);
  const [isProductProfile, setIsProductProfile] = useState(false);
  const [isServiceProfile, setIsServiceProfile] = useState(false);
  const [isEventProfile, setIsEventProfile] = useState(false);
  const [isOrganizationProfile, setIsOrganizationProfile] = useState(false);
  const [isCauseProfile, setIsCauseProfile] = useState(false);
  const [isProjectProfile, setIsProjectProfile] = useState(false);
  const [isMovementProfile, setIsMovementProfile] = useState(false);
  const [isCampaignProfile, setIsCampaignProfile] = useState(false);
  const [isInitiativeProfile, setIsInitiativeProfile] = useState(false);
  const [isChallengeProfile, setIsChallengeProfile] = useState(false);
  const [isCompetitionProfile, setIsCompetitionProfile] = useState(false);
  const [isContestProfile, setIsContestProfile] = useState(false);
  const [isGiveawayProfile, setIsGiveawayProfile] = useState(false);
  const [isSweepstakesProfile, setIsSweepstakesProfile] = useState(false);
  const [isRaffleProfile, setIsRaffleProfile] = useState(false);
  const [isAuctionProfile, setIsAuctionProfile] = useState(false);
  const [isDonationProfile, setIsDonationProfile] = useState(false);
  const [isFundraiserProfile, setIsFundraiserProfile] = useState(false);
  const [isCrowdfundingProfile, setIsCrowdfundingProfile] = useState(false);
  const [isInvestmentProfile, setIsInvestmentProfile] = useState(false);
  const [isVentureProfile, setIsVentureProfile] = useState(false);
  const [isStartupProfile, setIsStartupProfile] = useState(false);
  const [isSmallBusinessProfile, setIsSmallBusinessProfile] = useState(false);
  const [isMediumBusinessProfile, setIsMediumBusinessProfile] = useState(false);
  const [isLargeBusinessProfile, setIsLargeBusinessProfile] = useState(false);
  const [isEnterpriseProfile, setIsEnterpriseProfile] = useState(false);
  const [isCorporationProfile, setIsCorporationProfile] = useState(false);
  const [isMultinationalProfile, setIsMultinationalProfile] = useState(false);
  const [isGlobalProfile, setIsGlobalProfile] = useState(false);
  const [isLocalProfile, setIsLocalProfile] = useState(false);
  const [isRegionalProfile, setIsRegionalProfile] = useState(false);
  const [isNationalProfile, setIsNationalProfile] = useState(false);
  const [isInternationalProfile, setIsInternationalProfile] = useState(false);
  const [isWorldwideProfile, setIsWorldwideProfile] = useState(false);
  const [isUniverseProfile, setIsUniverseProfile] = useState(false);
  const [isEarthProfile, setIsEarthProfile] = useState(false);
  const [isPlanetProfile, setIsPlanetProfile] = useState(false);
  const [isSolarSystemProfile, setIsSolarSystemProfile] = useState(false);
  const [isGalaxyProfile, setIsGalaxyProfile] = useState(false);
  const [isClusterProfile, setIsClusterProfile] = useState(false);
  const [isSuperclusterProfile, setIsSuperclusterProfile] = useState(false);
  const [isFilamentProfile, setIsFilamentProfile] = useState(false);
  const [isVoidProfile, setIsVoidProfile] = useState(false);
  const [isWallProfile, setIsWallProfile] = useState(false);
  const [isSheetVisibleProfile, setSheetVisibleProfile] = useState(false);
  const [isDropdownOpenProfile, setIsDropdownOpenProfile] = useState(false);
  const [isCopiedProfile, setIsCopiedProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isCommentsSectionOpen, setIsCommentsSectionOpen] = useState(false);
  const [isCommentsSectionOpenProfile, setIsCommentsSectionOpenProfile] = useState(false);
  const [isCommentsSectionOpenPost, setIsCommentsSectionOpenPost] = useState(false);
  const [isCommentsSectionOpenSearch, setIsCommentsSectionOpenSearch] = useState(false);
  const [isCommentsSectionOpenDiscovery, setIsCommentsSectionOpenDiscovery] = useState(false);
  const [isCommentsSectionOpenFeed, setIsCommentsSectionOpenFeed] = useState(false);
  const [isCommentsSectionOpenNotifications, setIsCommentsSectionOpenNotifications] = useState(false);
  const [isCommentsSectionOpenMessages, setIsCommentsSectionOpenMessages] = useState(false);
  const [isCommentsSectionOpenSettings, setIsCommentsSectionOpenSettings] = useState(false);
  const [isCommentsSectionOpenHelp, setIsCommentsSectionOpenHelp] = useState(false);
  const [isCommentsSectionOpenAbout, setIsCommentsSectionOpenAboutProfile] = useState(false);
  const [isCommentsSectionOpenTerms, setIsCommentsSectionOpenTermsProfile] = useState(false);
  const [isCommentsSectionOpenPrivacy, setIsCommentsSectionOpenPrivacyProfile] = useState(false);
  const [isCommentsSectionOpenCookies, setIsCommentsSectionOpenCookiesProfile] = useState(false);
  const [isCommentsSectionOpenAccessibility, setIsCommentsSectionOpenAccessibilityProfile] = useState(false);
  const [isCommentsSectionOpenSecurity, setIsCommentsSectionOpenSecurityProfile] = useState(false);
  const [isCommentsSectionOpenContact, setIsCommentsSectionOpenContactProfile] = useState(false);
  const [isCommentsSectionOpenSupport, setIsCommentsSectionOpenSupportProfile] = useState(false);
  const [isCommentsSectionOpenFeedback, setIsCommentsSectionOpenFeedbackProfile] = useState(false);
  const [isCommentsSectionOpenReport, setIsCommentsSectionOpenReportProfile] = useState(false);
  const [isCommentsSectionOpenBlock, setIsCommentsSectionOpenBlockProfile] = useState(false);
  const [isCommentsSectionOpenUnblock, setIsCommentsSectionOpenUnblockProfile] = useState(false);
  const [isCommentsSectionOpenDelete, setIsCommentsSectionOpenDeleteProfile] = useState(false);
  const [isCommentsSectionOpenEdit, setIsCommentsSectionOpenEditProfile] = useState(false);
  const [isCommentsSectionOpenSave, setIsCommentsSectionOpenSaveProfile] = useState(false);
  const [isCommentsSectionOpenUnsave, setIsCommentsSectionOpenUnsaveProfile] = useState(false);
  const [isCommentsSectionOpenFollow, setIsCommentsSectionOpenFollowProfile] = useState(false);
  const [isCommentsSectionOpenUnfollow, setIsCommentsSectionOpenUnfollowProfile] = useState(false);
  const [isCommentsSectionOpenConnect, setIsCommentsSectionOpenConnectProfile] = useState(false);
  const [isCommentsSectionOpenDisconnect, setIsCommentsSectionOpenDisconnectProfile] = useState(false);
  const [isCommentsSectionOpenAccept, setIsCommentsSectionOpenAcceptProfile] = useState(false);
  const [isCommentsSectionOpenDecline, setIsCommentsSectionOpenDeclineProfile] = useState(false);
  const [isCommentsSectionOpenCancel, setIsCommentsSectionOpenCancelProfile] = useState(false);
  const [isCommentsSectionOpenRequest, setIsCommentsSectionOpenRequestProfile] = useState(false);
  const [isCommentsSectionOpenRemove, setIsCommentsSectionOpenRemoveProfile] = useState(false);
  const [isCommentsSectionOpenIgnore, setIsCommentsSectionOpenIgnoreProfile] = useState(false);
  const [isCommentsSectionOpenReportPost, setIsCommentsSectionOpenReportPostProfile] = useState(false);
  const [isCommentsSectionOpenBlockPost, setIsCommentsSectionOpenBlockPostProfile] = useState(false);
  const [isCommentsSectionOpenUnblockPost, setIsCommentsSectionOpenUnblockPostProfile] = useState(false);
  const [isCommentsSectionOpenDeletePost, setIsCommentsSectionOpenDeletePostProfile] = useState(false);
  const [isCommentsSectionOpenEditPost, setIsCommentsSectionOpenEditPostProfile] = useState(false);
  const [isCommentsSectionOpenSavePost, setIsCommentsSectionOpenSavePostProfile] = useState(false);
  const [isCommentsSectionOpenUnsavePost, setIsCommentsSectionOpenUnsavePostProfile] = useState(false);
  const [isCommentsSectionOpenLikePost, setIsCommentsSectionOpenLikePostProfile] = useState(false);
  const [isCommentsSectionOpenUnlikePost, setIsCommentsSectionOpenUnlikePostProfile] = useState(false);
  const [isCommentsSectionOpenCommentPost, setIsCommentsSectionOpenCommentPostProfile] = useState(false);
  const [isCommentsSectionOpenSharePost, setIsCommentsSectionOpenSharePostProfile] = useState(false);
  const [isCommentsSectionOpenReportComment, setIsCommentsSectionOpenReportCommentProfile] = useState(false);
  const [isCommentsSectionOpenBlockComment, setIsCommentsSectionOpenBlockCommentProfile] = useState(false);
  const [isCommentsSectionOpenUnblockComment, setIsCommentsSectionOpenUnblockCommentProfile] = useState(false);
  const [isCommentsSectionOpenDeleteComment, setIsCommentsSectionOpenDeleteCommentProfile] = useState(false);
  const [isCommentsSectionOpenEditComment, setIsCommentsSectionOpenEditCommentProfile] = useState(false);
  const [isCommentsSectionOpenLikeComment, setIsCommentsSectionOpenLikeCommentProfile] = useState(false);
  const [isCommentsSectionOpenUnlikeComment, setIsCommentsSectionOpenUnlikeCommentProfile] = useState(false);
  const [isCommentsSectionOpenReplyComment, setIsCommentsSectionOpenReplyCommentProfile] = useState(false);
  const [isCommentsSectionOpenReportReply, setIsCommentsSectionOpenReportReplyProfile] = useState(false);
  const [isCommentsSectionOpenBlockReply, setIsCommentsSectionOpenBlockReplyProfile] = useState(false);
  const [isCommentsSectionOpenUnblockReply, setIsCommentsSectionOpenUnblockReplyProfile] = useState(false);
  const [isCommentsSectionOpenDeleteReply, setIsCommentsSectionOpenDeleteReplyProfile] = useState(false);
  const [isCommentsSectionOpenEditReply, setIsCommentsSectionOpenEditReplyProfile] = useState(false);
  const [isCommentsSectionOpenLikeReply, setIsCommentsSectionOpenLikeReplyProfile] = useState(false);
  const [isCommentsSectionOpenUnlikeReply, setIsCommentsSectionOpenUnlikeReplyProfile] = useState(false);
  const [isCommentsSectionOpenFollowHashtag, setIsCommentsSectionOpenFollowHashtagProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowHashtag, setIsCommentsSectionOpenUnfollowHashtagProfile] = useState(false);
  const [isCommentsSectionOpenFollowTopic, setIsCommentsSectionOpenFollowTopicProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowTopic, setIsCommentsSectionOpenUnfollowTopicProfile] = useState(false);
  const [isCommentsSectionOpenFollowCategory, setIsCommentsSectionOpenFollowCategoryProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowCategory, setIsCommentsSectionOpenUnfollowCategoryProfile] = useState(false);
  const [isCommentsSectionOpenFollowTag, setIsCommentsSectionOpenFollowTagProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowTag, setIsCommentsSectionOpenUnfollowTagProfile] = useState(false);
  const [isCommentsSectionOpenFollowLocation, setIsCommentsSectionOpenFollowLocationProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowLocation, setIsCommentsSectionOpenUnfollowLocationProfile] = useState(false);
  const [isCommentsSectionOpenFollowEvent, setIsCommentsSectionOpenFollowEventProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowEvent, setIsCommentsSectionOpenUnfollowEventProfile] = useState(false);
  const [isCommentsSectionOpenFollowOrganization, setIsCommentsSectionOpenFollowOrganizationProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowOrganization, setIsCommentsSectionOpenUnfollowOrganizationProfile] = useState(false);
  const [isCommentsSectionOpenFollowCause, setIsCommentsSectionOpenFollowCauseProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowCause, setIsCommentsSectionOpenUnfollowCauseProfile] = useState(false);
  const [isCommentsSectionOpenFollowProject, setIsCommentsSectionOpenFollowProjectProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowProject, setIsCommentsSectionOpenUnfollowProjectProfile] = useState(false);
  const [isCommentsSectionOpenFollowMovement, setIsCommentsSectionOpenFollowMovementProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowMovement, setIsCommentsSectionOpenUnfollowMovementProfile] = useState(false);
  const [isCommentsSectionOpenFollowCampaign, setIsCommentsSectionOpenFollowCampaignProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowCampaign, setIsCommentsSectionOpenUnfollowCampaignProfile] = useState(false);
  const [isCommentsSectionOpenFollowInitiative, setIsCommentsSectionOpenFollowInitiativeProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowInitiative, setIsCommentsSectionOpenUnfollowInitiativeProfile] = useState(false);
  const [isCommentsSectionOpenFollowChallenge, setIsCommentsSectionOpenFollowChallengeProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowChallenge, setIsCommentsSectionOpenUnfollowChallengeProfile] = useState(false);
  const [isCommentsSectionOpenFollowCompetition, setIsCommentsSectionOpenFollowCompetitionProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowCompetition, setIsCommentsSectionOpenUnfollowCompetitionProfile] = useState(false);
  const [isCommentsSectionOpenFollowContest, setIsCommentsSectionOpenFollowContestProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowContest, setIsCommentsSectionOpenUnfollowContestProfile] = useState(false);
  const [isCommentsSectionOpenFollowGiveaway, setIsCommentsSectionOpenFollowGiveawayProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowGiveaway, setIsCommentsSectionOpenUnfollowGiveawayProfile] = useState(false);
  const [isCommentsSectionOpenFollowSweepstakes, setIsCommentsSectionOpenFollowSweepstakesProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowSweepstakes, setIsCommentsSectionOpenUnfollowSweepstakesProfile] = useState(false);
  const [isCommentsSectionOpenFollowRaffle, setIsCommentsSectionOpenFollowRaffleProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowRaffle, setIsCommentsSectionOpenUnfollowRaffleProfile] = useState(false);
  const [isCommentsSectionOpenFollowAuction, setIsCommentsSectionOpenFollowAuctionProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowAuction, setIsCommentsSectionOpenUnfollowAuctionProfile] = useState(false);
  const [isCommentsSectionOpenFollowDonation, setIsCommentsSectionOpenFollowDonationProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowDonation, setIsCommentsSectionOpenUnfollowDonationProfile] = useState(false);
  const [isCommentsSectionOpenFollowFundraiser, setIsCommentsSectionOpenFollowFundraiserProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowFundraiser, setIsCommentsSectionOpenUnfollowFundraiserProfile] = useState(false);
  const [isCommentsSectionOpenFollowCrowdfunding, setIsCommentsSectionOpenFollowCrowdfundingProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowCrowdfunding, setIsCommentsSectionOpenUnfollowCrowdfundingProfile] = useState(false);
  const [isCommentsSectionOpenFollowInvestment, setIsCommentsSectionOpenFollowInvestmentProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowInvestment, setIsCommentsSectionOpenUnfollowInvestmentProfile] = useState(false);
  const [isCommentsSectionOpenFollowVenture, setIsCommentsSectionOpenFollowVentureProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowVenture, setIsCommentsSectionOpenUnfollowVentureProfile] = useState(false);
  const [isCommentsSectionOpenFollowStartup, setIsCommentsSectionOpenFollowStartupProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowStartup, setIsCommentsSectionOpenUnfollowStartupProfile] = useState(false);
  const [isCommentsSectionOpenFollowSmallBusiness, setIsCommentsSectionOpenFollowSmallBusinessProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowSmallBusiness, setIsCommentsSectionOpenUnfollowSmallBusinessProfile] = useState(false);
  const [isCommentsSectionOpenFollowMediumBusiness, setIsCommentsSectionOpenFollowMediumBusinessProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowMediumBusiness, setIsCommentsSectionOpenUnfollowMediumBusinessProfile] = useState(false);
  const [isCommentsSectionOpenFollowLargeBusiness, setIsCommentsSectionOpenFollowLargeBusinessProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowLargeBusiness, setIsCommentsSectionOpenUnfollowLargeBusinessProfile] = useState(false);
  const [isCommentsSectionOpenFollowEnterprise, setIsCommentsSectionOpenFollowEnterpriseProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowEnterprise, setIsCommentsSectionOpenUnfollowEnterpriseProfile] = useState(false);
  const [isCommentsSectionOpenFollowCorporation, setIsCommentsSectionOpenFollowCorporationProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowCorporation, setIsCommentsSectionOpenUnfollowCorporationProfile] = useState(false);
  const [isCommentsSectionOpenFollowMultinational, setIsCommentsSectionOpenFollowMultinationalProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowMultinational, setIsCommentsSectionOpenUnfollowMultinationalProfile] = useState(false);
  const [isCommentsSectionOpenFollowGlobal, setIsCommentsSectionOpenFollowGlobalProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowGlobal, setIsCommentsSectionOpenUnfollowGlobalProfile] = useState(false);
  const [isCommentsSectionOpenFollowLocal, setIsCommentsSectionOpenFollowLocalProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowLocal, setIsCommentsSectionOpenUnfollowLocalProfile] = useState(false);
  const [isCommentsSectionOpenFollowRegional, setIsCommentsSectionOpenFollowRegionalProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowRegional, setIsCommentsSectionOpenUnfollowRegionalProfile] = useState(false);
  const [isCommentsSectionOpenFollowNational, setIsCommentsSectionOpenFollowNationalProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowNational, setIsCommentsSectionOpenUnfollowNationalProfile] = useState(false);
  const [isCommentsSectionOpenFollowInternational, setIsCommentsSectionOpenFollowInternationalProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowInternational, setIsCommentsSectionOpenUnfollowInternationalProfile] = useState(false);
  const [isCommentsSectionOpenFollowWorldwide, setIsCommentsSectionOpenFollowWorldwideProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowWorldwide, setIsCommentsSectionOpenUnfollowWorldwideProfile] = useState(false);
  const [isCommentsSectionOpenFollowUniverse, setIsCommentsSectionOpenFollowUniverseProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowUniverse, setIsCommentsSectionOpenUnfollowUniverseProfile] = useState(false);
  const [isCommentsSectionOpenFollowEarth, setIsCommentsSectionOpenFollowEarthProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowEarth, setIsCommentsSectionOpenUnfollowEarthProfile] = useState(false);
  const [isCommentsSectionOpenFollowPlanet, setIsCommentsSectionOpenFollowPlanetProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowPlanet, setIsCommentsSectionOpenUnfollowPlanetProfile] = useState(false);
  const [isCommentsSectionOpenFollowSolarSystem, setIsCommentsSectionOpenFollowSolarSystemProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowSolarSystem, setIsCommentsSectionOpenUnfollowSolarSystemProfile] = useState(false);
  const [isCommentsSectionOpenFollowGalaxy, setIsCommentsSectionOpenFollowGalaxyProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowGalaxy, setIsCommentsSectionOpenUnfollowGalaxyProfile] = useState(false);
  const [isCommentsSectionOpenFollowCluster, setIsCommentsSectionOpenFollowClusterProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowCluster, setIsCommentsSectionOpenUnfollowClusterProfile] = useState(false);
  const [isCommentsSectionOpenFollowSupercluster, setIsCommentsSectionOpenFollowSuperclusterProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowSupercluster, setIsCommentsSectionOpenUnfollowSuperclusterProfile] = useState(false);
  const [isCommentsSectionOpenFollowFilament, setIsCommentsSectionOpenFollowFilamentProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowFilament, setIsCommentsSectionOpenUnfollowFilamentProfile] = useState(false);
  const [isCommentsSectionOpenFollowVoid, setIsCommentsSectionOpenFollowVoidProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowVoid, setIsCommentsSectionOpenUnfollowVoidProfile] = useState(false);
  const [isCommentsSectionOpenFollowWall, setIsCommentsSectionOpenFollowWallProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowWall, setIsCommentsSectionOpenUnfollowWallProfile] = useState(false);
  const [isCommentsSectionOpenFollowSheet, setIsCommentsSectionOpenFollowSheetProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowSheet, setIsCommentsSectionOpenUnfollowSheetProfile] = useState(false);
  const [isCommentsSectionOpenFollowDropdown, setIsCommentsSectionOpenFollowDropdownProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowDropdown, setIsCommentsSectionOpenUnfollowDropdownProfile] = useState(false);
  const [isCommentsSectionOpenFollowCopy, setIsCommentsSectionOpenFollowCopyProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowCopy, setIsCommentsSectionOpenUnfollowCopyProfile] = useState(false);
  const [isCommentsSectionOpenFollowTime, setIsCommentsSectionOpenFollowTimeProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowTime, setIsCommentsSectionOpenUnfollowTimeProfile] = useState(false);
  const [isCommentsSectionOpenFollowDate, setIsCommentsSectionOpenFollowDateProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowDate, setIsCommentsSectionOpenUnfollowDateProfile] = useState(false);
  const [isCommentsSectionOpenFollowLocationProfile, setIsCommentsSectionOpenFollowLocationProfileProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowLocationProfile, setIsCommentsSectionOpenUnfollowLocationProfileProfile] = useState(false);
  const [isCommentsSectionOpenFollowWebsite, setIsCommentsSectionOpenFollowWebsiteProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowWebsite, setIsCommentsSectionOpenUnfollowWebsiteProfile] = useState(false);
  const [isCommentsSectionOpenFollowEmail, setIsCommentsSectionOpenFollowEmailProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowEmail, setIsCommentsSectionOpenUnfollowEmailProfile] = useState(false);
  const [isCommentsSectionOpenFollowPhone, setIsCommentsSectionOpenFollowPhoneProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowPhone, setIsCommentsSectionOpenUnfollowPhoneProfile] = useState(false);
  const [isCommentsSectionOpenFollowAddress, setIsCommentsSectionOpenFollowAddressProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowAddress, setIsCommentsSectionOpenUnfollowAddressProfile] = useState(false);
  const [isCommentsSectionOpenFollowCity, setIsCommentsSectionOpenFollowCityProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowCity, setIsCommentsSectionOpenUnfollowCityProfile] = useState(false);
  const [isCommentsSectionOpenFollowState, setIsCommentsSectionOpenFollowStateProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowState, setIsCommentsSectionOpenUnfollowStateProfile] = useState(false);
  const [isCommentsSectionOpenFollowCountry, setIsCommentsSectionOpenFollowCountryProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowCountry, setIsCommentsSectionOpenUnfollowCountryProfile] = useState(false);
  const [isCommentsSectionOpenFollowZip, setIsCommentsSectionOpenFollowZipProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowZip, setIsCommentsSectionOpenUnfollowZipProfile] = useState(false);
  const [isCommentsSectionOpenFollowCode, setIsCommentsSectionOpenFollowCodeProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowCode, setIsCommentsSectionOpenUnfollowCodeProfile] = useState(false);
  const [isCommentsSectionOpenFollowNumber, setIsCommentsSectionOpenFollowNumberProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowNumber, setIsCommentsSectionOpenUnfollowNumberProfile] = useState(false);
  const [isCommentsSectionOpenFollowId, setIsCommentsSectionOpenFollowIdProfile] = useState(false);
  const [isCommentsSectionOpenUnfollowId, setIsCommentsSectionOpenUnfollowIdProfile] = useState(false);
  const [isCommentsSectionOpenFollowKey, setIsCommentsSectionOpenFollowKeyProfile] = useState(false);
  const
