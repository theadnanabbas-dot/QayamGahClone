import PropertyOwnerLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Edit, Save, Mail, Phone } from "lucide-react";

function ProfileContent() {
  return (
    <div className="space-y-6" data-testid="profile-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Edit Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your personal information and account settings.
        </p>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Profile Management Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Edit your personal details, contact information, and account preferences. Update your profile picture and business information.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" data-testid="button-edit-profile-placeholder">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" data-testid="button-update-contact-placeholder">
                <Phone className="h-4 w-4 mr-2" />
                Update Contact
              </Button>
              <Button data-testid="button-save-changes-placeholder">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Profile() {
  return (
    <PropertyOwnerLayout>
      <ProfileContent />
    </PropertyOwnerLayout>
  );
}