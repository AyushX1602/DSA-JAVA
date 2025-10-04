import { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { authUserAtom, setAuthStateAtom } from '@/lib/auth.atoms';
import { useUpdateProfile } from '@/hooks/react-query/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Edit, Save, X, User } from 'lucide-react';

const UserProfile = () => {
  const user = useAtomValue(authUserAtom);
  const setAuthState = useSetAtom(setAuthStateAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.city || '',
    country: user?.country || '',
  });

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

  const handleEdit = () => {
    setForm({
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      city: user?.city || '',
      country: user?.country || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfile(form);
      if (result.success) {
        // Update the auth state with the new user data
        setAuthState({
          user: result.user,
          token: localStorage.getItem('authToken'),
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
    : (user?.email?.[0] || 'U').toUpperCase();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            Please log in to view your profile
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="size-24">
                <AvatarFallback className="text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {user.name || 'User'}
                </CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
                {user.role === 'ADMIN' && (
                  <span className="inline-block mt-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={onChange}
                    required
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={form.phoneNumber}
                    onChange={onChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={onChange}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={form.country}
                      onChange={onChange}
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isPending} className="flex-1">
                    {isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Name
                    </Label>
                    <p className="text-sm">{user.name || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Email
                    </Label>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Phone Number
                    </Label>
                    <p className="text-sm">
                      {user.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      City
                    </Label>
                    <p className="text-sm">{user.city || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Country
                    </Label>
                    <p className="text-sm">{user.country || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Member Since
                    </Label>
                    <p className="text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button onClick={handleEdit} className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
