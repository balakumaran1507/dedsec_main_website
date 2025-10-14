import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { 
  MessageCircle,
  Plus,
  X,
  ThumbsUp,
  Reply,
  Send,
  Filter,
  TrendingUp,
  Clock
} from 'lucide-react';

function Community() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('recent');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [viewPost, setViewPost] = useState(null);

  // Demo posts (later store in Firebase)
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Tips for SQL Injection Beginners',
      content: 'Just wanted to share some resources that helped me get started with SQL injection. Check out PortSwigger Web Security Academy - it\'s free and has great labs!',
      author: 'you',
      authorEmail: 'hacker@dedsec.net',
      date: '2025-10-14',
      likes: 12,
      likedBy: [],
      comments: [
        {
          id: 101,
          author: 'teammate1',
          authorEmail: 'teammate1@dedsec.net',
          content: 'Great resource! Also recommend OWASP Juice Shop for practice.',
          date: '2025-10-14',
          likes: 5,
          likedBy: [],
          replies: [
            {
              id: 201,
              author: 'you',
              authorEmail: 'hacker@dedsec.net',
              content: 'Yes! Juice Shop is amazing. Good call.',
              date: '2025-10-14',
              likes: 2,
              likedBy: []
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Who\'s joining picoCTF 2025?',
      content: 'Registration opens next week. Anyone interested in teaming up? Would be great to coordinate as a group!',
      author: 'teammate2',
      authorEmail: 'teammate2@dedsec.net',
      date: '2025-10-13',
      likes: 8,
      likedBy: [],
      comments: [
        {
          id: 102,
          author: 'teammate1',
          authorEmail: 'teammate1@dedsec.net',
          content: 'I\'m in! Let\'s do it.',
          date: '2025-10-13',
          likes: 3,
          likedBy: [],
          replies: []
        }
      ]
    },
    {
      id: 3,
      title: 'Crypto challenge help needed',
      content: 'Stuck on a RSA challenge. The public exponent is really small (e=3). Any hints on what attack to use?',
      author: 'teammate3',
      authorEmail: 'teammate3@dedsec.net',
      date: '2025-10-12',
      likes: 5,
      likedBy: [],
      comments: [
        {
          id: 103,
          author: 'you',
          authorEmail: 'hacker@dedsec.net',
          content: 'Small e = 3 means you might be vulnerable to a low exponent attack. Try taking the cube root of the ciphertext!',
          date: '2025-10-12',
          likes: 7,
          likedBy: [],
          replies: [
            {
              id: 202,
              author: 'teammate3',
              authorEmail: 'teammate3@dedsec.net',
              content: 'OMG IT WORKED! Thanks so much!',
              date: '2025-10-12',
              likes: 4,
              likedBy: []
            }
          ]
        }
      ]
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: '',
    content: ''
  });

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'popular') {
      return b.likes - a.likes;
    }
    return 0;
  });

  // Create post
  const createPost = () => {
    if (!newPost.title || !newPost.content) {
      alert('Please fill in title and content!');
      return;
    }

    const post = {
      id: Date.now(),
      ...newPost,
      author: user.email.split('@')[0],
      authorEmail: user.email,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      likedBy: [],
      comments: []
    };

    setPosts(prev => [post, ...prev]);
    
    // TODO: Update user XP (+25 for post)
    alert('🎉 Post created! +25 XP');

    setNewPost({ title: '', content: '' });
    setShowNewPostModal(false);
  };

  // Like post
  const likePost = (postId) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const alreadyLiked = post.likedBy.includes(user.email);
          return {
            ...post,
            likes: alreadyLiked ? post.likes - 1 : post.likes + 1,
            likedBy: alreadyLiked
              ? post.likedBy.filter(email => email !== user.email)
              : [...post.likedBy, user.email]
          };
        }
        return post;
      })
    );
  };

  // Add comment
  const addComment = (postId) => {
    if (!replyContent.trim()) return;

    const comment = {
      id: Date.now(),
      author: user.email.split('@')[0],
      authorEmail: user.email,
      content: replyContent,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      likedBy: [],
      replies: []
    };

    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    );

    // TODO: Update user XP (+5 for comment)
    alert('💬 Comment added! +5 XP');

    setReplyContent('');
    setReplyingTo(null);
  };

  // Add reply to comment
  const addReply = (postId, commentId) => {
    if (!replyContent.trim()) return;

    const reply = {
      id: Date.now(),
      author: user.email.split('@')[0],
      authorEmail: user.email,
      content: replyContent,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      likedBy: []
    };

    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, replies: [...comment.replies, reply] }
                : comment
            )
          };
        }
        return post;
      })
    );

    alert('💬 Reply added! +5 XP');
    setReplyContent('');
    setReplyingTo(null);
  };

  // Like comment
  const likeComment = (postId, commentId, isReply = false, parentCommentId = null) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map(comment => {
              if (isReply && comment.id === parentCommentId) {
                return {
                  ...comment,
                  replies: comment.replies.map(reply => {
                    if (reply.id === commentId) {
                      const alreadyLiked = reply.likedBy.includes(user.email);
                      return {
                        ...reply,
                        likes: alreadyLiked ? reply.likes - 1 : reply.likes + 1,
                        likedBy: alreadyLiked
                          ? reply.likedBy.filter(email => email !== user.email)
                          : [...reply.likedBy, user.email]
                      };
                    }
                    return reply;
                  })
                };
              } else if (!isReply && comment.id === commentId) {
                const alreadyLiked = comment.likedBy.includes(user.email);
                return {
                  ...comment,
                  likes: alreadyLiked ? comment.likes - 1 : comment.likes + 1,
                  likedBy: alreadyLiked
                    ? comment.likedBy.filter(email => email !== user.email)
                    : [...comment.likedBy, user.email]
                };
              }
              return comment;
            })
          };
        }
        return post;
      })
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <div className="text-matrix-green text-xl">
          <span className="animate-spin inline-block">⚙️</span> Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-terminal-muted hover:text-matrix-green transition-colors flex items-center gap-2"
      >
        ← Back to Dashboard
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-matrix-green mb-2 flex items-center gap-3">
              <MessageCircle className="w-10 h-10" />
              Community
            </h1>
            <p className="text-terminal-muted">Team discussions, tips & questions</p>
          </div>
          <button
            onClick={() => setShowNewPostModal(true)}
            className="bg-matrix-green text-terminal-bg px-6 py-3 rounded font-semibold hover:bg-matrix-dark transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            New Post
          </button>
        </div>

        {/* Stats & Sort */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold text-matrix-green">{posts.length}</div>
                <div className="text-xs text-terminal-muted">Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-matrix-green">
                  {posts.reduce((sum, p) => sum + p.comments.length, 0)}
                </div>
                <div className="text-xs text-terminal-muted">Comments</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-terminal-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {sortedPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              onLike={() => likePost(post.id)}
              onClick={() => setViewPost(post)}
            />
          ))}
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <NewPostModal
          newPost={newPost}
          setNewPost={setNewPost}
          onCreate={createPost}
          onClose={() => setShowNewPostModal(false)}
        />
      )}

      {/* View Post Modal (with comments) */}
      {viewPost && (
        <ViewPostModal
          post={viewPost}
          user={user}
          onLikePost={() => likePost(viewPost.id)}
          onLikeComment={likeComment}
          onAddComment={addComment}
          onAddReply={addReply}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          onClose={() => {
            setViewPost(null);
            setReplyingTo(null);
            setReplyContent('');
          }}
        />
      )}
    </div>
  );
}

// Post Card Component
function PostCard({ post, user, onLike, onClick }) {
  const isLiked = post.likedBy.includes(user.email);
  const totalComments = post.comments.length + post.comments.reduce((sum, c) => sum + c.replies.length, 0);

  return (
    <div
      onClick={onClick}
      className="bg-terminal-card border border-terminal-border rounded-lg p-6 hover:border-matrix-green transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Like Section */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            className={`p-2 rounded transition-colors ${
              isLiked ? 'text-matrix-green' : 'text-terminal-muted hover:text-matrix-green'
            }`}
          >
            <ThumbsUp size={20} className={isLiked ? 'fill-current' : ''} />
          </button>
          <span className="text-sm font-semibold text-matrix-green">{post.likes}</span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-terminal-text mb-2">{post.title}</h3>
          <p className="text-terminal-muted mb-3 line-clamp-2">{post.content}</p>
          
          <div className="flex items-center gap-4 text-sm text-terminal-muted">
            <span>by {post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} />
              {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// New Post Modal
function NewPostModal({ newPost, setNewPost, onCreate, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-terminal-card border-2 border-matrix-green rounded-lg p-6 w-full max-w-2xl z-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-matrix-green">New Post</h2>
          <button onClick={onClose} className="text-terminal-muted hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Title *</label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              placeholder="What's on your mind?"
            />
          </div>

          <div>
            <label className="block text-terminal-muted text-sm mb-2">Content *</label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              rows="6"
              placeholder="Share your thoughts, tips, or questions..."
            />
          </div>

          <div className="bg-matrix-dim border border-matrix-green rounded p-3 text-sm text-matrix-green">
            💰 You will earn <span className="font-bold">+25 XP</span> for creating this post
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onCreate}
              className="flex-1 bg-matrix-green text-terminal-bg py-3 rounded font-semibold hover:bg-matrix-dark transition-colors"
            >
              Create Post
            </button>
            <button
              onClick={onClose}
              className="px-6 bg-terminal-bg border border-terminal-border text-terminal-muted rounded hover:text-terminal-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// View Post Modal (Full view with comments)
function ViewPostModal({ 
  post, 
  user, 
  onLikePost, 
  onLikeComment, 
  onAddComment, 
  onAddReply,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onClose 
}) {
  const isLiked = post.likedBy.includes(user.email);

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-terminal-card border-2 border-matrix-green rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-50">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-matrix-green mb-2">{post.title}</h2>
            <div className="flex items-center gap-3 text-sm text-terminal-muted">
              <span>by {post.author}</span>
              <span>•</span>
              <span>{post.date}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-terminal-muted hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="bg-terminal-bg border border-terminal-border rounded p-4 mb-6">
          <p className="text-terminal-text whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Like Button */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-terminal-border">
          <button
            onClick={onLikePost}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              isLiked
                ? 'bg-matrix-dim text-matrix-green border border-matrix-green'
                : 'bg-terminal-bg text-terminal-muted hover:text-matrix-green border border-terminal-border'
            }`}
          >
            <ThumbsUp size={18} className={isLiked ? 'fill-current' : ''} />
            <span>{post.likes}</span>
          </button>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="text-lg font-semibold text-matrix-green mb-4">
            Comments ({post.comments.length})
          </h3>

          {/* Add Comment */}
          {replyingTo === null && (
            <div className="mb-6">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text text-sm mb-2"
                rows="3"
                placeholder="Add a comment... (+5 XP)"
              />
              <button
                onClick={() => onAddComment(post.id)}
                className="bg-matrix-green text-terminal-bg px-4 py-2 rounded text-sm font-semibold hover:bg-matrix-dark transition-colors flex items-center gap-2"
              >
                <Send size={16} />
                Comment
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments.map(comment => (
              <div key={comment.id} className="bg-terminal-bg border border-terminal-border rounded p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onLikeComment(post.id, comment.id)}
                    className={`p-1 rounded transition-colors ${
                      comment.likedBy.includes(user.email)
                        ? 'text-matrix-green'
                        : 'text-terminal-muted hover:text-matrix-green'
                    }`}
                  >
                    <ThumbsUp size={14} className={comment.likedBy.includes(user.email) ? 'fill-current' : ''} />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-terminal-text">{comment.author}</span>
                      <span className="text-xs text-terminal-muted">{comment.date}</span>
                      <span className="text-xs text-matrix-green">{comment.likes} likes</span>
                    </div>
                    <p className="text-terminal-text text-sm mb-2">{comment.content}</p>
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="text-xs text-terminal-muted hover:text-matrix-green flex items-center gap-1"
                    >
                      <Reply size={12} />
                      Reply
                    </button>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="w-full bg-terminal-card border border-terminal-border rounded px-3 py-2 text-terminal-text text-sm mb-2"
                          rows="2"
                          placeholder="Write a reply... (+5 XP)"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => onAddReply(post.id, comment.id)}
                            className="bg-matrix-green text-terminal-bg px-3 py-1 rounded text-xs font-semibold hover:bg-matrix-dark transition-colors"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                            className="bg-terminal-bg border border-terminal-border text-terminal-muted px-3 py-1 rounded text-xs hover:text-terminal-text transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-3 ml-6 space-y-3">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="flex items-start gap-2">
                            <button
                              onClick={() => onLikeComment(post.id, reply.id, true, comment.id)}
                              className={`p-1 rounded transition-colors ${
                                reply.likedBy.includes(user.email)
                                  ? 'text-matrix-green'
                                  : 'text-terminal-muted hover:text-matrix-green'
                              }`}
                            >
                              <ThumbsUp size={12} className={reply.likedBy.includes(user.email) ? 'fill-current' : ''} />
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-terminal-text">{reply.author}</span>
                                <span className="text-xs text-terminal-muted">{reply.date}</span>
                                <span className="text-xs text-matrix-green">{reply.likes} likes</span>
                              </div>
                              <p className="text-terminal-text text-xs">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Community;