'use client';

import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, limit } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Users, FolderKanban, Heart, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { SchoolDashboardChart } from '@/components/school/dashboard-chart';
import { VerificationScanner } from '@/components/school/verification-scanner';
import type { User, Project, School } from '@/lib/types';

export default function SchoolDashboardPage() {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  const profileRef = useMemoFirebase(
    () => (firestore && currentUser ? doc(firestore, 'users', currentUser.uid) : null),
    [firestore, currentUser]
  );
  const { data: profile } = useDoc<User>(profileRef);

  const schoolRef = useMemoFirebase(
    () => (firestore && profile?.schoolId ? doc(firestore, 'schools', profile.schoolId) : null),
    [firestore, profile?.schoolId]
  );
  const { data: school } = useDoc<School>(schoolRef);

  const studentsQuery = useMemoFirebase(
    () =>
      firestore && profile?.schoolId
        ? query(collection(firestore, 'users'), where('schoolId', '==', profile.schoolId), where('institutionRole', '==', 'Pupil'))
        : null,
    [firestore, profile?.schoolId]
  );
  const { data: students, isLoading: studentsLoading } = useCollection<User>(studentsQuery);

  const schoolProjectsQuery = useMemoFirebase(
    () =>
      firestore && profile?.schoolId
        ? query(collection(firestore, 'projects'), limit(100))
        : null,
    [firestore, profile?.schoolId]
  );
  const { data: allProjects } = useCollection<Project>(schoolProjectsQuery);

  const isLoading = studentsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const schoolStudents = students || [];
  const schoolStudentIds = schoolStudents.map(s => s.id);
  const schoolProjects = allProjects?.filter(p => schoolStudentIds.includes(p.userId)) || [];

  const totalStudents = schoolStudents.length;
  const totalProjects = schoolProjects.length;
  const totalFollowers = schoolStudents.reduce((sum, s) => sum + (s.followers || 0), 0);

  const chartData = [
    { level: 'Beginner', count: schoolProjects.filter(p => p.skillLevel === 'Beginner').length },
    { level: 'Intermediate', count: schoolProjects.filter(p => p.skillLevel === 'Intermediate').length },
    { level: 'Advanced', count: schoolProjects.filter(p => p.skillLevel === 'Advanced').length },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div className="flex items-center gap-3">
                <h1 className="font-headline text-3xl font-bold">
                Welcome, {profile?.fullName}
                </h1>
                {school?.institutionType && (
                    <Badge variant="secondary" className="font-headline uppercase tracking-wider">
                        {school.institutionType}
                    </Badge>
                )}
            </div>
            <p className="text-muted-foreground">
            Institutional Dashboard for {school?.name || 'your institution'}.
            </p>
        </div>
        <div className="flex items-center gap-3">
            <VerificationScanner />
        </div>
      </header>

      {/* Verification Status Banner */}
      {!profile?.approved && (
        <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                        <p className="font-bold">Institutional Verification Pending</p>
                        <p className="text-muted-foreground">Scan your registration docs to verify your school's profile.</p>
                    </div>
                </div>
                <VerificationScanner />
            </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Pupils</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impact</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFollowers} followers</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Innovation Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SchoolDashboardChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
            <CardDescription>
              Pupils currently under your supervision.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pupil</TableHead>
                  <TableHead className="text-right">Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolStudents.slice(0, 5).map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.profilePicture} />
                          <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Link href={`/profile/${student.id}`} className="font-medium text-xs hover:underline truncate max-w-[100px]">
                          {student.fullName}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-[10px]">{student.levelOfStudies}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
