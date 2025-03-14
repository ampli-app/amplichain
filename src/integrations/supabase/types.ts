export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      connection_requests: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connection_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string | null
          id: string
          user_id1: string
          user_id2: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id1: string
          user_id2: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id1?: string
          user_id2?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_user_id1_fkey"
            columns: ["user_id1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_id2_fkey"
            columns: ["user_id2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      consultation_orders: {
        Row: {
          amount: number
          client_id: string
          completed_at: string | null
          consultation_id: string
          contact_method: string | null
          created_at: string
          date: string | null
          expert_id: string
          expires_at: string
          id: string
          is_client_confirmed: boolean | null
          is_completed: boolean | null
          is_expert_confirmed: boolean | null
          is_online: boolean | null
          is_paid: boolean | null
          location: string | null
          price: number
          status: string
          time: string | null
        }
        Insert: {
          amount: number
          client_id: string
          completed_at?: string | null
          consultation_id: string
          contact_method?: string | null
          created_at?: string
          date?: string | null
          expert_id: string
          expires_at: string
          id?: string
          is_client_confirmed?: boolean | null
          is_completed?: boolean | null
          is_expert_confirmed?: boolean | null
          is_online?: boolean | null
          is_paid?: boolean | null
          location?: string | null
          price?: number
          status?: string
          time?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          completed_at?: string | null
          consultation_id?: string
          contact_method?: string | null
          created_at?: string
          date?: string | null
          expert_id?: string
          expires_at?: string
          id?: string
          is_client_confirmed?: boolean | null
          is_completed?: boolean | null
          is_expert_confirmed?: boolean | null
          is_online?: boolean | null
          is_paid?: boolean | null
          location?: string | null
          price?: number
          status?: string
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_orders_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_ratings: {
        Row: {
          client_id: string | null
          comment: string | null
          consultation_id: string | null
          created_at: string
          expert_id: string | null
          id: string
          order_id: string | null
          rating: number
        }
        Insert: {
          client_id?: string | null
          comment?: string | null
          consultation_id?: string | null
          created_at?: string
          expert_id?: string | null
          id?: string
          order_id?: string | null
          rating: number
        }
        Update: {
          client_id?: string | null
          comment?: string | null
          consultation_id?: string | null
          created_at?: string
          expert_id?: string | null
          id?: string
          order_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "consultation_ratings_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "consultation_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_reviews: {
        Row: {
          comment: string | null
          consultation_id: string
          consultation_user_id: string
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          consultation_id: string
          consultation_user_id: string
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          consultation_id?: string
          consultation_user_id?: string
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_reviews_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "consultation_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          availability: string[] | null
          categories: string[] | null
          category_id: string | null
          contact_methods: string[] | null
          created_at: string
          description: string | null
          experience: string | null
          id: string
          images: Json | null
          is_online: boolean | null
          location: string | null
          price: number
          subcategory_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string[] | null
          categories?: string[] | null
          category_id?: string | null
          contact_methods?: string[] | null
          created_at?: string
          description?: string | null
          experience?: string | null
          id?: string
          images?: Json | null
          is_online?: boolean | null
          location?: string | null
          price: number
          subcategory_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string[] | null
          categories?: string[] | null
          category_id?: string | null
          contact_methods?: string[] | null
          created_at?: string
          description?: string | null
          experience?: string | null
          id?: string
          images?: Json | null
          is_online?: boolean | null
          location?: string | null
          price?: number
          subcategory_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "consultation_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "consultation_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          unread_count: number
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          unread_count?: number
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          unread_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_text: string | null
          last_message_time: string | null
          product_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_text?: string | null
          last_message_time?: string | null
          product_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_text?: string | null
          last_message_time?: string | null
          product_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_options: {
        Row: {
          created_at: string | null
          id: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          price?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          min_order_value: number | null
          name: string
          single_use_per_user: boolean | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          min_order_value?: number | null
          name: string
          single_use_per_user?: boolean | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          min_order_value?: number | null
          name?: string
          single_use_per_user?: boolean | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      discount_usage: {
        Row: {
          discount_code_id: string
          discount_value: number
          id: string
          order_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          discount_code_id: string
          discount_value: number
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          discount_code_id?: string
          discount_value?: number
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_usage_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      discover_sliders: {
        Row: {
          active: boolean | null
          background_position: string | null
          button_text: string
          created_at: string
          description: string
          id: string
          image_url: string
          link: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          background_position?: string | null
          button_text: string
          created_at?: string
          description: string
          id?: string
          image_url: string
          link: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          background_position?: string | null
          button_text?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          link?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string | null
          degree: string
          id: string
          institution: string
          profile_id: string | null
          year: string
        }
        Insert: {
          created_at?: string | null
          degree: string
          id?: string
          institution: string
          profile_id?: string | null
          year: string
        }
        Update: {
          created_at?: string | null
          degree?: string
          id?: string
          institution?: string
          profile_id?: string | null
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_info: {
        Row: {
          content: string
          created_at: string
          equipment_id: string | null
          id: string
          is_private: boolean | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          equipment_id?: string | null
          id?: string
          is_private?: boolean | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          equipment_id?: string | null
          id?: string
          is_private?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_info_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "stolen_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      experience: {
        Row: {
          company: string
          created_at: string | null
          id: string
          period: string
          position: string
          profile_id: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          id?: string
          period: string
          position: string
          profile_id?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          id?: string
          period?: string
          position?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      feed_post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "feed_post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_post_files: {
        Row: {
          created_at: string
          id: string
          name: string
          post_id: string
          size: number
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          post_id: string
          size: number
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          post_id?: string
          size?: number
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_post_files_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_post_hashtags: {
        Row: {
          created_at: string
          hashtag_id: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          hashtag_id: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          hashtag_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_post_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_post_media: {
        Row: {
          created_at: string
          id: string
          post_id: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_post_poll_options: {
        Row: {
          created_at: string
          id: string
          post_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_post_poll_options_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_post_poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_post_poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "feed_post_poll_options"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_poll: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_poll?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_poll?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      followings: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followings_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followings_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_join_requests: {
        Row: {
          created_at: string
          group_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          notifications_enabled: boolean
          role: Database["public"]["Enums"]["group_role"]
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          notifications_enabled?: boolean
          role?: Database["public"]["Enums"]["group_role"]
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          notifications_enabled?: boolean
          role?: Database["public"]["Enums"]["group_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "group_post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "group_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      group_post_files: {
        Row: {
          created_at: string
          id: string
          name: string
          post_id: string
          size: number
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          post_id: string
          size: number
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          post_id?: string
          size?: number
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_post_files_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "group_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      group_post_hashtags: {
        Row: {
          created_at: string
          hashtag_id: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          hashtag_id: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          hashtag_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_post_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "group_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      group_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "group_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      group_post_media: {
        Row: {
          created_at: string
          id: string
          post_id: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "group_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      group_post_poll_options: {
        Row: {
          created_at: string
          id: string
          post_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_post_poll_options_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "group_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      group_post_poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_post_poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "group_post_poll_options"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          is_poll: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          is_poll?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          is_poll?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          category: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          is_private: boolean | null
          name: string
          profile_image: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          profile_image?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          profile_image?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hashtags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
          text: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
          text: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
          read: boolean | null
          recipient_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
          read?: boolean | null
          recipient_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          read?: boolean | null
          recipient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_details"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "product_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_reservations: {
        Row: {
          created_at: string | null
          id: string
          payment_deadline: string | null
          product_id: string
          quantity: number
          reservation_expires_at: string
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_deadline?: string | null
          product_id: string
          quantity?: number
          reservation_expires_at: string
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_deadline?: string | null
          product_id?: string
          quantity?: number
          reservation_expires_at?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_details"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "product_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_secret: string | null
          created_at: string | null
          currency: string
          id: string
          order_id: string | null
          payment_intent_id: string | null
          payment_method: string | null
          reservation_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_secret?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          order_id?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          reservation_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_secret?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          order_id?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          reservation_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_details"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "product_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "order_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_delivery_options: {
        Row: {
          created_at: string | null
          delivery_option_id: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          delivery_option_id: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          delivery_option_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_delivery_options_delivery_option_id_fkey"
            columns: ["delivery_option_id"]
            isOneToOne: false
            referencedRelation: "delivery_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_delivery_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_orders: {
        Row: {
          buyer_id: string
          created_at: string
          delivery_option_id: string | null
          delivery_price: number | null
          discount_code: string | null
          discount_value: number | null
          id: string
          notes: string | null
          order_type: string | null
          payment_deadline: string | null
          payment_intent_id: string | null
          payment_method: string | null
          payment_status: string | null
          product_id: string
          product_price: number | null
          reservation_expires_at: string | null
          seller_id: string
          service_fee: number | null
          shipping_address: string | null
          shipping_method: string | null
          status: string
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          delivery_option_id?: string | null
          delivery_price?: number | null
          discount_code?: string | null
          discount_value?: number | null
          id?: string
          notes?: string | null
          order_type?: string | null
          payment_deadline?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_id: string
          product_price?: number | null
          reservation_expires_at?: string | null
          seller_id: string
          service_fee?: number | null
          shipping_address?: string | null
          shipping_method?: string | null
          status?: string
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          delivery_option_id?: string | null
          delivery_price?: number | null
          discount_code?: string | null
          discount_value?: number | null
          id?: string
          notes?: string | null
          order_type?: string | null
          payment_deadline?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_id?: string
          product_price?: number | null
          reservation_expires_at?: string | null
          seller_id?: string
          service_fee?: number | null
          shipping_address?: string | null
          shipping_method?: string | null
          status?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_orders_delivery_option_id_fkey"
            columns: ["delivery_option_id"]
            isOneToOne: false
            referencedRelation: "delivery_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          product_user_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          product_user_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          product_user_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          category_id: string | null
          condition: string | null
          created_at: string
          description: string | null
          for_testing: boolean | null
          id: string
          image_url: string | null
          location: string | null
          price: number
          rating: number | null
          review_count: number | null
          sale: boolean | null
          sale_percentage: number | null
          status: string
          subcategory_id: string | null
          testing_price: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          for_testing?: boolean | null
          id?: string
          image_url?: string | null
          location?: string | null
          price: number
          rating?: number | null
          review_count?: number | null
          sale?: boolean | null
          sale_percentage?: number | null
          status?: string
          subcategory_id?: string | null
          testing_price?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          for_testing?: boolean | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: number
          rating?: number | null
          review_count?: number | null
          sale?: boolean | null
          sale_percentage?: number | null
          status?: string
          subcategory_id?: string | null
          testing_price?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          connections: number | null
          email: string | null
          followers: number | null
          following: number | null
          full_name: string | null
          id: string
          joined_date: string | null
          location: string | null
          role: string | null
          specialties: string[] | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          connections?: number | null
          email?: string | null
          followers?: number | null
          following?: number | null
          full_name?: string | null
          id: string
          joined_date?: string | null
          location?: string | null
          role?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          connections?: number | null
          email?: string | null
          followers?: number | null
          following?: number | null
          full_name?: string | null
          id?: string
          joined_date?: string | null
          location?: string | null
          role?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          image_url: string | null
          profile_id: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          profile_id?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          profile_id?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          service_id: string
          service_user_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          service_id: string
          service_user_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          service_id?: string
          service_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          price: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stolen_equipment: {
        Row: {
          additional_details: Json | null
          category_id: string | null
          contact_info: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          image_url: string | null
          location: string
          serial_number: string | null
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_details?: Json | null
          category_id?: string | null
          contact_info?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          image_url?: string | null
          location: string
          serial_number?: string | null
          status: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_details?: Json | null
          category_id?: string | null
          contact_info?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string
          serial_number?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stolen_equipment_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_payments: {
        Row: {
          amount_total: number
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          order_id: string
          payment_intent_client_secret: string | null
          payment_intent_id: string | null
          payment_method: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_total: number
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          order_id: string
          payment_intent_client_secret?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_total?: number
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          order_id?: string
          payment_intent_client_secret?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_details"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "stripe_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "product_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          api_version: string | null
          created: string | null
          data: Json | null
          id: string
          processed: boolean | null
          processing_errors: string[] | null
        }
        Insert: {
          api_version?: string | null
          created?: string | null
          data?: Json | null
          id: string
          processed?: boolean | null
          processing_errors?: string[] | null
        }
        Update: {
          api_version?: string | null
          created?: string | null
          data?: Json | null
          id?: string
          processed?: boolean | null
          processing_errors?: string[] | null
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      order_details: {
        Row: {
          buyer_avatar: string | null
          buyer_id: string | null
          buyer_name: string | null
          created_at: string | null
          delivery_option_id: string | null
          delivery_option_name: string | null
          delivery_price: number | null
          notes: string | null
          order_id: string | null
          payment_method: string | null
          product_id: string | null
          product_image: string | null
          product_title: string | null
          seller_avatar: string | null
          seller_id: string | null
          seller_name: string | null
          shipping_address: string | null
          shipping_method: string | null
          status: string | null
          total_amount: number | null
          tracking_number: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_orders_delivery_option_id_fkey"
            columns: ["delivery_option_id"]
            isOneToOne: false
            referencedRelation: "delivery_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_moderate_group: {
        Args: {
          group_id: string
          user_id: string
        }
        Returns: boolean
      }
      cleanup_expired_orders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_stripe_payment_intent: {
        Args: {
          p_order_id: string
          p_amount: number
          p_currency?: string
          p_payment_method?: string
          p_description?: string
          p_customer_email?: string
          p_customer_name?: string
        }
        Returns: Json
      }
      find_or_create_conversation: {
        Args: {
          p_user_id1: string
          p_user_id2: string
          p_type?: string
          p_product_id?: string
        }
        Returns: string
      }
      get_user_conversations: {
        Args: {
          p_user_id: string
        }
        Returns: string[]
      }
      get_user_group_role: {
        Args: {
          group_id: string
          user_id: string
        }
        Returns: string
      }
      is_admin_in_any_group: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_global_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_group_member: {
        Args: {
          group_id: string
          user_id: string
        }
        Returns: boolean
      }
      link_hashtag_to_post: {
        Args: {
          p_post_id: string
          p_hashtag_name: string
        }
        Returns: string
      }
      link_post_hashtag: {
        Args: {
          p_post_id: string
          p_hashtag_id: string
        }
        Returns: undefined
      }
      register_discount_usage: {
        Args: {
          p_discount_id: string
          p_user_id: string
          p_order_id: string
          p_discount_value: number
        }
        Returns: boolean
      }
      update_payment_status: {
        Args: {
          p_payment_intent_id: string
          p_status: string
        }
        Returns: undefined
      }
      url_encode: {
        Args: {
          data: string
        }
        Returns: string
      }
      validate_discount_code: {
        Args: {
          p_code: string
          p_user_id: string
          p_order_value: number
        }
        Returns: Json
      }
    }
    Enums: {
      group_role: "admin" | "moderator" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
