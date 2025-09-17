import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PropertyOwnerLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Eye, Edit, X, MapPin, Star, Users, Bed, Bath } from "lucide-react";

interface Property {
  id: string;
  title: string;
  address: string;
  pricePerHour: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  rating: string;
  isActive: boolean;
  ownerId: string;
  mainImage: string;
  description?: string;
  amenities: string[];
  images: string[];
}

interface City {
  id: string;
  name: string;
}

interface PropertyCategory {
  id: string;
  name: string;
}

function PropertiesContent() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  
  const { toast } = useToast();

  // Get current user from localStorage
  const userString = localStorage.getItem("property_owner_user");
  const user = userString ? JSON.parse(userString) : null;
  const userId = user?.id;

  const { data: allProperties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"]
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"]
  });

  const { data: categories = [] } = useQuery<PropertyCategory[]>({
    queryKey: ["/api/property-categories"]
  });

  // Filter properties owned by current user
  const myProperties = allProperties.filter(property => property.ownerId === userId);

  const handleView = (property: Property) => {
    setSelectedProperty(property);
    setViewModalOpen(true);
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setEditFormData({
      title: property.title,
      description: property.description || "",
      address: property.address,
      pricePerHour: property.pricePerHour,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
    });
    setEditModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedProperty) return;

    try {
      const response = await fetch(`/api/properties/${selectedProperty.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to update property");
      }

      toast({
        title: "Success!",
        description: "Property updated successfully.",
      });
      setEditModalOpen(false);
      // Refresh the data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-red-500";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  return (
    <div className="space-y-6" data-testid="all-properties-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          All Properties
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage all your rental properties in one place.
        </p>
      </div>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            My Properties ({myProperties.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myProperties.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't added any properties yet. Click "Add New Property" to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price/Hour</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myProperties.map((property) => (
                  <TableRow key={property.id} data-testid={`property-row-${property.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={property.mainImage} 
                          alt={property.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {property.title}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 space-x-2">
                            <Bed className="h-3 w-3" />
                            <span>{property.bedrooms}</span>
                            <Bath className="h-3 w-3" />
                            <span>{property.bathrooms}</span>
                            <Users className="h-3 w-3" />
                            <span>{property.maxGuests}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.address.slice(0, 40)}...</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">Rs. {property.pricePerHour}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(property.isActive)}>
                        {getStatusText(property.isActive)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(property)}
                          data-testid={`button-view-${property.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(property)}
                          data-testid={`button-edit-${property.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Property Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="view-property-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Property Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewModalOpen(false)}
                data-testid="button-close-view-modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src={selectedProperty.mainImage} 
                  alt={selectedProperty.title}
                  className="w-full h-48 rounded-lg object-cover"
                />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{selectedProperty.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedProperty.address}
                  </p>
                  <p className="text-lg font-semibold text-green-600">Rs. {selectedProperty.pricePerHour}/hour</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" /> {selectedProperty.bedrooms} bedrooms
                    </span>
                    <span className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" /> {selectedProperty.bathrooms} bathrooms
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" /> {selectedProperty.maxGuests} guests
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{selectedProperty.rating} rating</span>
                  </div>
                </div>
              </div>
              
              {selectedProperty.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedProperty.description}</p>
                </div>
              )}
              
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline">{amenity}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                <Badge className={getStatusColor(selectedProperty.isActive)}>
                  {getStatusText(selectedProperty.isActive)}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Property Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="edit-property-modal">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update your property details and save changes.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Property Title</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title || ""}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  data-testid="input-edit-title"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description || ""}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  className="min-h-[80px]"
                  data-testid="input-edit-description"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editFormData.address || ""}
                  onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                  data-testid="input-edit-address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price Per Hour (Rs.)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editFormData.pricePerHour || ""}
                    onChange={(e) => setEditFormData({...editFormData, pricePerHour: e.target.value})}
                    data-testid="input-edit-price"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-guests">Max Guests</Label>
                  <Input
                    id="edit-guests"
                    type="number"
                    value={editFormData.maxGuests || ""}
                    onChange={(e) => setEditFormData({...editFormData, maxGuests: parseInt(e.target.value)})}
                    data-testid="input-edit-guests"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-bedrooms">Bedrooms</Label>
                  <Input
                    id="edit-bedrooms"
                    type="number"
                    value={editFormData.bedrooms || ""}
                    onChange={(e) => setEditFormData({...editFormData, bedrooms: parseInt(e.target.value)})}
                    data-testid="input-edit-bedrooms"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-bathrooms">Bathrooms</Label>
                  <Input
                    id="edit-bathrooms"
                    type="number"
                    value={editFormData.bathrooms || ""}
                    onChange={(e) => setEditFormData({...editFormData, bathrooms: parseInt(e.target.value)})}
                    data-testid="input-edit-bathrooms"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditModalOpen(false)}
                  data-testid="button-discard-edit"
                >
                  Discard
                </Button>
                <Button 
                  onClick={handleSaveChanges}
                  data-testid="button-save-changes"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AllProperties() {
  return (
    <PropertyOwnerLayout>
      <PropertiesContent />
    </PropertyOwnerLayout>
  );
}