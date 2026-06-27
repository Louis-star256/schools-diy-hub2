'use client';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { ProjectCard } from '@/components/projects/project-card';
import { schools, users as allUsers } from '@/lib/placeholder-data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function SchoolProjectsPage() {
  const firestore = useFirestore();
  // For now, let's hardcode the school ID. In a real app, this would come from auth.
  const schoolId = 'school-1';
  const school = schools.find((s) => s.id === schoolId);
  const students = allUsers.filter((u) => u.schoolId === schoolId);
  const studentIds = students.map((s) => s.id);

  const schoolProjectsQuery = useMemoFirebase(
    () =>
      firestore && studentIds.length > 0
        ? query(
            collection(firestore, 'projects'),
            where('userId', 'in', studentIds),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, studentIds]
  );
  
  const { data: schoolProjects, isLoading } = useCollection<Project>(schoolProjectsQuery);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold">
          Projects from {school?.name}
        </h1>
        <p className="text-muted-foreground">
          A gallery of all projects created by your students.
        </p>
      </header>

      {isLoading ? (
         <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : schoolProjects && schoolProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {schoolProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Card className="flex h-96 flex-col items-center justify-center text-center">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold">No Projects Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Your students haven't posted any projects yet. Encourage them to
              start creating!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    