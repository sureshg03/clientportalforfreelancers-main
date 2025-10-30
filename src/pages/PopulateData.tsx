import { useState } from "react";
import { populateDummyData, clearDummyData } from "../lib/dummyData";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import {
  Database,
  Users,
  FolderKanban,
  Star,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export function PopulateData() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePopulateData = async () => {
    setLoading(true);
    setMessage("");

    try {
      await populateDummyData();
      setMessage("✅ Dummy data populated successfully!");
    } catch (error) {
      console.error("Error populating data:", error);
      setMessage("❌ Error populating dummy data. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all dummy data? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await clearDummyData();
      setMessage("✅ Dummy data cleared successfully!");
    } catch (error) {
      console.error("Error clearing data:", error);
      setMessage("❌ Error clearing dummy data. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Only show this page for logged-in users (remove admin restriction for development)
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardBody className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">
              You must be logged in to access this page.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Populate Dummy Data</h1>
          <p className="text-gray-600 mt-1">
            Add sample data for testing the application
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Populate Data Card */}
        <Card hover>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Populate Data</h3>
                <p className="text-sm text-gray-600">Add sample freelancers, projects, and reviews</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>8 Tamil freelancers with diverse skills</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>2 Client companies</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FolderKanban className="w-4 h-4 text-purple-500" />
                  <span>5 Sample projects (draft, open, in-progress, completed)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>5 Sample reviews and ratings</span>
                </div>
              </div>

              <Button
                onClick={handlePopulateData}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Populating...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Populate Dummy Data
                  </>
                )}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Clear Data Card */}
        <Card hover>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Clear Data</h3>
                <p className="text-sm text-gray-600">Remove all dummy data from the database</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Warning</p>
                    <p className="text-xs text-red-700 mt-1">
                      This will permanently delete all dummy data. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleClearData}
                disabled={loading}
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Dummy Data
                  </>
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Sample Data Preview</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Freelancers:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Arun Kumar - React/Node.js Developer ($45/hr, 4.8⭐)</li>
                <li>• Priya Senthil - Full-stack Python Developer ($50/hr, 4.9⭐)</li>
                <li>• Karthik Rajan - Mobile App Developer ($55/hr, 4.7⭐)</li>
                <li>• Deepika Venkatesh - UI/UX Designer ($40/hr, 4.6⭐)</li>
                <li>• Suresh Babu - DevOps Engineer ($60/hr, 4.8⭐)</li>
                <li>• Lakshmi Narayanan - Data Scientist ($65/hr, 4.9⭐)</li>
                <li>• Ravi Chandran - WordPress Developer ($35/hr, 4.5⭐)</li>
                <li>• Anitha Balasubramanian - Content Writer ($30/hr, 4.7⭐)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Clients:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Rajesh Kumar - TechStart Solutions</li>
                <li>• Meera Srinivasan - Creative Agency</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Projects:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• E-commerce Website Development ($5,000) - Open</li>
                <li>• Mobile App for Restaurant ($8,000) - In Progress</li>
                <li>• Brand Identity Design ($2,500) - Completed</li>
                <li>• Content Marketing Strategy ($3,000) - Open</li>
                <li>• Data Analytics Dashboard ($6,000) - Draft</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}