
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Loader2, UserPlus } from 'lucide-react';
import type { User, School } from '@/lib/types';
import { AddStudentDialog } from '@/components/school/add-student-dialog';

export default function SchoolStudentsPage() {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  const currentUserProfileRef = useMemoFirebase(
    () => (firestore && currentUser ? doc(firestore, 'users', currentUser.uid) : null),
    [firestore, currentUser]
  );
  const { data: currentUserProfile } = useDoc<User>(currentUserProfileRef);

  const schoolRef = useMemoFirebase(
    () => (firestore && currentUserProfile?.schoolId ? doc(firestore, 'schools', currentUserProfile.schoolId) : null),
    [firestore, currentUserProfile?.schoolId]
  );
  const { data: school } = useDoc<School>(schoolRef);

  const studentsQuery = useMemoFirebase(
    () =>
      firestore && currentUserProfile?.schoolId
        ? query(
            collection(firestore, 'users'),
            where('schoolId', '==', currentUserProfile.schoolId),
            where('institutionRole', '==', 'Pupil')
          )
        : null,
    [firestore, currentUserProfile?.schoolId]
  );
  const { data: students, isLoading } = useCollection<User>(studentsQuery);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Students at {school?.name || 'the Institution'}</CardTitle>
            <CardDescription>
              View and manage innovators registered under your supervision.
            </CardDescription>
          </div>
          <AddStudentDialog 
            schoolId={currentUserProfile?.schoolId || ''} 
            institutionType={school?.type || 'Secondary Institution'}
          />
        </div>
      </CardHeader>
      <CardContent>
        {students && students.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Level of Study</TableHead>
                <TableHead className="text-right">Followers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.profilePicture} alt={student.fullName} />
                        <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/profile/${student.id}`}
                          className="font-medium hover:underline"
                        >
                          {student.fullName}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{student.levelOfStudies || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {student.followers || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No students registered yet. Click "Add Student" to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
