import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getReviewsForUser, subscribeToReviews } from "../lib/api";
import { Card, CardBody } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Filter,
  Award,
} from "lucide-react";

interface Review {
  id: string;
  project_title: string;
  reviewer_name: string;
  reviewee_name: string;
  rating: number;
  comment: string;
  created_at: string;
  review_type: "client_to_freelancer" | "freelancer_to_client";
  is_positive: boolean;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  positiveReviews: number;
  negativeReviews: number;
  fiveStarReviews: number;
}

export function Reviews() {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    positiveReviews: 0,
    negativeReviews: 0,
    fiveStarReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    loadReviews();

    // realtime subscription
    const channel = subscribeToReviews(profile.id, (_payload: any) => {
      // when reviews change, reload list
      loadReviews();
    });

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Reviews page safety timeout reached, setting loading to false');
      setLoading(false);
    }, 10000); // 10 seconds

    return () => {
      try {
        channel.unsubscribe();
      } catch (err) {
        // ignore
      }
      clearTimeout(timeout);
    };
  }, [profile]);

  const loadReviews = async () => {
    if (!profile) return;

    try {
      const data = await getReviewsForUser(profile.id);
      // Map API response to local interface
      const mapped = data.map((r: any) => ({
        id: r.id,
        project_title: r.projects?.title || 'Unknown Project',
        reviewer_name: r.profiles?.full_name || 'Unknown User',
        reviewee_name: profile.full_name,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        review_type: (profile.role === 'freelancer' ? 'client_to_freelancer' : 'freelancer_to_client') as 'client_to_freelancer' | 'freelancer_to_client',
        is_positive: r.rating >= 4,
      }));

      setReviews(mapped);

      // Calculate stats
      const totalReviews = mapped.length;
      const averageRating = totalReviews > 0 ? mapped.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
      const positiveReviews = mapped.filter((r) => r.is_positive).length;
      const negativeReviews = totalReviews - positiveReviews;
      const fiveStarReviews = mapped.filter((r) => r.rating === 5).length;

      setStats({
        totalReviews,
        averageRating,
        positiveReviews,
        negativeReviews,
        fiveStarReviews,
      });
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filterType === "all") return true;
    if (filterType === "positive") return review.is_positive;
    if (filterType === "negative") return !review.is_positive;
    return true;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">
            {profile?.role === "freelancer"
              ? "See what clients say about your work"
              : "Review your freelancers and projects"}
          </p>
        </div>
        {profile?.role === "client" && (
          <Button size="lg">
            <MessageSquare className="w-5 h-5 mr-2" />
            Write Review
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <div className="flex items-center space-x-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <div className="flex">
                    {renderStars(Math.round(stats.averageRating))}
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600 fill-current" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalReviews}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Positive</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.positiveReviews}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">5-Star Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.fiveStarReviews}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Reviews
              </button>
              <button
                onClick={() => setFilterType("positive")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "positive"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Positive
              </button>
              <button
                onClick={() => setFilterType("negative")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "negative"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Needs Improvement
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No reviews found</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                {filterType !== "all"
                  ? "Try changing your filter"
                  : "Reviews will appear here once projects are completed"}
              </p>
              {profile?.role === "client" && filterType === "all" && (
                <Button>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Write Your First Review
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} hover>
              <CardBody>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {review.reviewer_name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {review.reviewer_name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          ({review.rating}/5)
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      Project:{" "}
                      <span className="font-medium">
                        {review.project_title}
                      </span>
                    </p>

                    <p className="text-gray-700 leading-relaxed mb-3">
                      {review.comment}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {review.is_positive ? (
                          <Badge
                            variant="success"
                            className="flex items-center space-x-1"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Positive</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="warning"
                            className="flex items-center space-x-1"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            <span>Needs Improvement</span>
                          </Badge>
                        )}
                      </div>

                      {profile?.role === "client" && (
                        <Button variant="outline" size="sm">
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
