
import { Conversation } from '@/api/entities';
import { Message } from '@/api/entities';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Notification } from '@/api/entities'; // Direct entity usage

export class MessageUtils {
  // Create or get existing conversation between two users about a venue
  static async getOrCreateConversation(userId1, userId2, venueId = null) {
    try {
      // Validate inputs
      if (!userId1 || !userId2) {
        throw new Error('Both user IDs are required');
      }

      // Sort user IDs to ensure consistent conversation lookup
      const sortedIds = [userId1, userId2].sort();
      
      // Look for existing conversation between these users
      let existingConversations = [];
      try {
        existingConversations = await Conversation.filter({
          participant_ids: { '$all': sortedIds }
        });
      } catch (filterError) {
        console.warn('Failed to filter conversations, trying list approach:', filterError);
        // Fallback: get all conversations and filter client-side
        const allConversations = await Conversation.list('-last_message_timestamp', 100); // Limit to a reasonable number
        existingConversations = allConversations.filter(conv => {
            if (!conv.participant_ids || conv.participant_ids.length !== 2) return false;
            const convSortedIds = [...conv.participant_ids].sort();
            return convSortedIds[0] === sortedIds[0] && convSortedIds[1] === sortedIds[1];
        });
      }

      let conversation;
      
      if (existingConversations.length > 0) {
        // If venue-specific conversation exists, use it
        if (venueId) {
          const venueConversation = existingConversations.find(c => c.venue_id === venueId);
          if (venueConversation) {
            return venueConversation;
          }
        }
        // Otherwise use the most recent conversation (if no venue-specific or venueId not provided)
        conversation = existingConversations[0];
      } else {
        // Create new conversation
        let user1Name = 'User';
        let user2Name = 'User';
        let currentUser = null;
        try {
          currentUser = await User.me();
        } catch (e) {
          // Current user might not be logged in or `User.me()` might fail
          console.warn('Could not fetch current user:', e);
        }

        // Try to get user names, but don't fail if we can't
        if (currentUser) {
            if (userId1 === currentUser.id) {
                user1Name = currentUser.full_name || currentUser.email || 'You';
                // For the other user, we cannot fetch their details directly in this scenario
                // if we don't have access or they are not public.
                // We'll leave user2Name as 'User' or try to fetch if we had a general User.getById.
                // For now, keep it simple as specified: 'Other User'
                user2Name = 'Other User'; 
            } else if (userId2 === currentUser.id) {
                user2Name = currentUser.full_name || currentUser.email || 'You';
                user1Name = 'Other User';
            }
        } else {
          // If no current user, or `User.me()` failed, use generic names
          user1Name = 'User';
          user2Name = 'User';
          // Optionally, if we want to try to fetch specific user details for 
          // userId1 and userId2, we would do it here using User.get(id)
          // but the outline suggests not failing on this and using placeholders.
        }

        let venueName = '';
        if (venueId) {
          try {
            const venue = await Venue.get(venueId);
            venueName = venue.title || '';
          } catch (venueError) {
            console.warn('Could not fetch venue name:', venueError);
          }
        }

        conversation = await Conversation.create({
          participant_ids: sortedIds,
          participant_names: [user1Name, user2Name],
          participant_avatars: ['', ''], // As per outline, set to empty strings
          venue_id: venueId,
          venue_name: venueName,
          last_message_content: '',
          last_message_timestamp: new Date().toISOString(),
          unread_by: []
        });
      }

      return conversation;
    } catch (error) {
      console.error('Failed to get or create conversation:', error);
      throw error;
    }
  }

  // Send a message in a conversation
  static async sendMessage(conversationId, senderId, content) {
    try {
      const sender = await User.get(senderId);
      
      // Create the message
      const message = await Message.create({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: sender.full_name || sender.email,
        content: content.trim()
      });

      // Update conversation with last message info
      const conversation = await Conversation.get(conversationId);
      const otherParticipantId = conversation.participant_ids.find(id => id !== senderId);
      
      await Conversation.update(conversationId, {
        last_message_content: content.trim(),
        last_message_timestamp: message.created_date,
        unread_by: [otherParticipantId] // Mark as unread for the other participant
      });
      
      // --- Create a notification for the recipient ---
      if (otherParticipantId) {
        await Notification.create({
            user_id: otherParticipantId,
            title: `New message from ${sender.full_name || sender.email}`,
            message: content.trim(),
            link: `/Messages`, // Link to the messages page
            type: 'new_message',
            is_read: false
        });
      }
      // --- End notification ---

      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // Get messages for a conversation
  static async getMessages(conversationId, limit = 50) {
    try {
      return await Message.filter(
        { conversation_id: conversationId },
        '-created_date',
        limit
      );
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw error;
    }
  }

  // Mark conversation as read for a user
  static async markAsRead(conversationId, userId) {
    try {
      const conversation = await Conversation.get(conversationId);
      const newUnreadBy = conversation.unread_by.filter(id => id !== userId);
      
      await Conversation.update(conversationId, {
        unread_by: newUnreadBy
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
      throw error;
    }
  }

  // Get conversations for a user
  static async getUserConversations(userId, limit = 20) {
    try {
      return await Conversation.filter(
        { participant_ids: { '$in': [userId] } },
        '-last_message_timestamp',
        limit
      );
    } catch (error) {
      console.error('Failed to get user conversations:', error);
      throw error;
    }
  }

  // Check if user has unread messages
  static async hasUnreadMessages(userId) {
    try {
      const conversations = await Conversation.filter(
        { 
          participant_ids: { '$in': [userId] },
          unread_by: { '$in': [userId] }
        },
        '-last_message_timestamp',
        1
      );
      return conversations.length > 0;
    } catch (error) {
      console.error('Failed to check unread messages:', error);
      return false;
    }
  }
}
