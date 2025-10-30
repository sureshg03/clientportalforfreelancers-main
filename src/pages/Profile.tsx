import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../lib/api';
import type { Profile } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  User,
  Calendar,
  Star,
  Briefcase,
  Edit,
  Save,
  X,
  Camera,
  Github,
  Linkedin,
  DollarSign,
  CheckCircle,
} from 'lucide-react';

interface ProfileFormData extends Profile {}

export function Profile() {
  const { profile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProfileFormData>>({});

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    loadProfile();
  }, [profile]);

  const loadProfile = async () => {
    if (!profile) return;

    try {
      const profileData = await getProfile(profile.id);
      if (profileData) {
        // Calculate member_since from created_at
        const member_since = profileData.created_at;

        // Calculate completed_projects based on role
        let completed_projects = 0;
        if (profileData.role === 'freelancer') {
          // For freelancers, count completed projects they're assigned to
          const { data: projectMembers } = await supabase
            .from('project_members')
            .select('project_id, projects(status)')
            .eq('freelancer_id', profile.id);

          completed_projects = projectMembers?.filter((pm: any) => pm.projects?.status === 'completed').length || 0;
        } else {
          // For clients, count their completed projects
          const { data: projects } = await supabase
            .from('projects')
            .select('status')
            .eq('client_id', profile.id)
            .eq('status', 'completed');

          completed_projects = projects?.length || 0;
        }

        const profileWithCalculatedFields = {
          ...profileData,
          member_since,
          completed_projects,
        };

        setProfileData(profileWithCalculatedFields);
        setEditForm(profileWithCalculatedFields);
      } else {
        // If getProfile fails, use the profile from context as fallback
        console.log('Using profile from context as fallback');
        const fallbackProfile = {
          ...profile,
          member_since: new Date().toISOString(),
          completed_projects: 0,
        };
        setProfileData(fallbackProfile);
        setEditForm(fallbackProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Use profile from context as fallback
      console.log('Using profile from context as fallback due to error');
      const fallbackProfile = {
        ...profile,
        member_since: new Date().toISOString(),
        completed_projects: 0,
      };
      setProfileData(fallbackProfile);
      setEditForm(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileData || !profile) return;

    setSaving(true);
    try {
      const updated = await updateProfile(profile.id, editForm as Partial<Profile>);
      setProfileData({ ...profileData, ...updated });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profileData || {});
    setIsEditing(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
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

  if (!profileData) {
    return (
      <div className="text-center py-20">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardBody className="pb-0">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profileData.full_name?.charAt(0).toUpperCase() || '?'}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profileData.full_name}</h1>
                  <p className="text-gray-600 capitalize">{profileData.role}</p>
                  {profileData.company_name && (
                    <p className="text-sm text-gray-500">{profileData.company_name}</p>
                  )}
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? 'outline' : 'default'}
                >
                  {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>

              {profileData.role === 'freelancer' && profileData.total_rating && (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(profileData.total_rating)}
                    <span className="text-sm text-gray-600 ml-1">
                      {profileData.total_rating.toFixed(1)} ({profileData.total_reviews} reviews)
                    </span>
                  </div>
                  {profileData.hourly_rate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${profileData.hourly_rate}/hr
                    </div>
                  )}
                </div>
              )}

              <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      {profileData.role === 'freelancer' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${profileData.total_earnings?.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Projects</p>
                  <p className="text-xl font-bold text-gray-900">{profileData.completed_projects}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profileData.member_since ? new Date(profileData.member_since).getFullYear() : new Date().getFullYear()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Social Links */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Social Links</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center space-x-3">
              <Linkedin className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editForm.linkedin_url || ''}
                    onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                    placeholder="LinkedIn URL"
                  />
                ) : (
                  profileData.linkedin_url ? (
                    <a
                      href={profileData.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700"
                    >
                      LinkedIn Profile
                    </a>
                  ) : (
                    <span className="text-gray-500">Not provided</span>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Github className="w-5 h-5 text-gray-700" />
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editForm.github_url || ''}
                    onChange={(e) => setEditForm({ ...editForm, github_url: e.target.value })}
                    placeholder="GitHub URL"
                  />
                ) : (
                  profileData.github_url ? (
                    <a
                      href={profileData.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700"
                    >
                      GitHub Profile
                    </a>
                  ) : (
                    <span className="text-gray-500">Not provided</span>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editForm.portfolio_url || ''}
                    onChange={(e) => setEditForm({ ...editForm, portfolio_url: e.target.value })}
                    placeholder="Portfolio URL"
                  />
                ) : (
                  profileData.portfolio_url ? (
                    <a
                      href={profileData.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Portfolio Website
                    </a>
                  ) : (
                    <span className="text-gray-500">Not provided</span>
                  )
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Skills (Freelancer only) */}
      {profileData.role === 'freelancer' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Skills & Expertise</h2>
          </CardHeader>
          <CardBody>
            {isEditing ? (
              <Input
                value={editForm.skills?.join(', ') || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                placeholder="Enter skills separated by commas"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profileData.skills?.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                )) || []}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}