
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function SchoolSettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold">School Settings</h1>
        <p className="text-muted-foreground">
          Manage your institution's profile and settings.
        </p>
      </header>
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your school's public information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school-name">School Name</Label>
              <Input id="school-name" defaultValue="Springfield High" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-type">Institution Type</Label>
              <Select defaultValue="Secondary Institution">
                <SelectTrigger id="school-type">
                  <SelectValue placeholder="Select institution type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary Institution">
                    Primary Institution
                  </SelectItem>
                  <SelectItem value="Secondary Institution">
                    Secondary Institution
                  </SelectItem>
                  <SelectItem value="Tertiary Institution">
                    Tertiary Institution
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            These actions are permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Delete School Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
