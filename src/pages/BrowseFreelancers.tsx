import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getFreelancers } from "../lib/api";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Search,
  Filter,
  Star,
  MapPin,
  DollarSign,
  Users,
  MessageSquare,
  Briefcase,
  Award,
  Clock,
} from "lucide-react";

interface Freelancer {
  id: string;
  full_name: string;
  bio: string;
  skills: string[];
  hourly_rate?: number;
  total_rating?: number;
  total_reviews?: number;
  location?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  total_earnings?: number;
  completed_projects?: number;
  member_since?: string;
}

export function BrowseFreelancers() {
  const { profile } = useAuth();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [rateFilter, setRateFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  useEffect(() => {
    loadFreelancers();
  }, []);

  useEffect(() => {
    filterFreelancers();
  }, [freelancers, searchTerm, skillFilter, rateFilter, ratingFilter]);

  const loadFreelancers = async () => {
    try {
      setLoading(true);
      
      // Safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('BrowseFreelancers: Safety timeout triggered after 3 seconds');
        setLoading(false);
      }, 3000);

      const data = await getFreelancers(100); // Get up to 100 freelancers
      
      clearTimeout(timeoutId);
      setFreelancers(data as Freelancer[]);
      setFilteredFreelancers(data as Freelancer[]);
    } catch (error) {
      console.error("Error loading freelancers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterFreelancers = () => {
    let filtered = freelancers.filter((freelancer) => {
      // Search filter
      const matchesSearch =
        freelancer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.skills?.some(skill =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Skill filter
      const matchesSkill = !skillFilter ||
        freelancer.skills?.some(skill =>
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        );

      // Rate filter
      let matchesRate = true;
      if (rateFilter !== "all" && freelancer.hourly_rate) {
        const rate = parseInt(rateFilter);
        if (rateFilter.includes("-")) {
          const [min, max] = rateFilter.split("-").map(Number);
          matchesRate = freelancer.hourly_rate >= min && freelancer.hourly_rate <= max;
        } else if (rateFilter.startsWith("under-")) {
          matchesRate = freelancer.hourly_rate < parseInt(rateFilter.replace("under-", ""));
        } else if (rateFilter.startsWith("over-")) {
          matchesRate = freelancer.hourly_rate > parseInt(rateFilter.replace("over-", ""));
        }
      }

      // Rating filter
      let matchesRating = true;
      if (ratingFilter !== "all" && freelancer.total_rating) {
        const minRating = parseFloat(ratingFilter);
        matchesRating = freelancer.total_rating >= minRating;
      }

      return matchesSearch && matchesSkill && matchesRate && matchesRating;
    });

    setFilteredFreelancers(filtered);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleContactFreelancer = (freelancer: Freelancer) => {
    // Navigate to messages with this freelancer
    const messageUrl = `/messages?contact=${freelancer.id}`;
    window.history.pushState({}, "", messageUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleViewProfile = (freelancer: Freelancer) => {
    // For now, just show an alert. In a real app, you'd navigate to freelancer profile
    alert(`View profile for ${freelancer.full_name}`);
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
          <h1 className="text-3xl font-bold text-gray-900">Browse Freelancers</h1>
          <p className="text-gray-600 mt-1">
            Find the perfect talent for your projects
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search freelancers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Skill Filter */}
            <div>
              <Input
                placeholder="Filter by skill..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
            </div>

            {/* Rate Filter */}
            <div>
              <select
                value={rateFilter}
                onChange={(e) => setRateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Rates</option>
                <option value="under-25">Under $25/hr</option>
                <option value="25-50">$25 - $50/hr</option>
                <option value="50-100">$50 - $100/hr</option>
                <option value="100-200">$100 - $200/hr</option>
                <option value="over-200">Over $200/hr</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Freelancers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredFreelancers.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardBody className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No freelancers found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your search or filters
                </p>
              </CardBody>
            </Card>
          </div>
        ) : (
          filteredFreelancers.map((freelancer) => (
            <Card key={freelancer.id} hover className="group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {freelancer.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {freelancer.full_name}
                      </h3>
                      {freelancer.location && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {freelancer.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {freelancer.total_rating && (
                    <div className="flex items-center space-x-1">
                      {renderStars(freelancer.total_rating)}
                      <span className="text-sm text-gray-600 ml-1">
                        ({freelancer.total_reviews})
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {/* Bio */}
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {freelancer.bio || "No bio available"}
                  </p>

                  {/* Skills */}
                  {freelancer.skills && freelancer.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {freelancer.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {freelancer.skills.length > 4 && (
                          <Badge variant="default" className="text-xs">
                            +{freelancer.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {freelancer.hourly_rate && (
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${freelancer.hourly_rate}/hr
                      </div>
                    )}
                    {freelancer.completed_projects !== undefined && (
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {freelancer.completed_projects} projects
                      </div>
                    )}
                    {freelancer.total_earnings && (
                      <div className="flex items-center text-gray-600">
                        <Award className="w-4 h-4 mr-1" />
                        ${freelancer.total_earnings.toLocaleString()} earned
                      </div>
                    )}
                    {freelancer.member_since && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        Member since {new Date(freelancer.member_since).getFullYear()}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewProfile(freelancer)}
                    >
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleContactFreelancer(freelancer)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
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